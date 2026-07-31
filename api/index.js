const express = require('express');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'wtfqznv7',
  api_key: process.env.CLOUDINARY_API_KEY || '995523526285398',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'I4i1k7SWy9otcDoeRIXOBElGKgs',
});

/**
 * Faz upload de uma imagem (base64 ou buffer) para o Cloudinary.
 * Retorna a URL segura ou null em caso de erro.
 */
async function uploadImageToCloudinary(source, publicId) {
  try {
    const result = await cloudinary.uploader.upload(source, {
      public_id: publicId,
      folder: 'cacs-blog',
      overwrite: true,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (e) {
    console.error('Erro ao fazer upload para Cloudinary:', e.message);
    return null;
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Configuração do MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  supportBigNumbers: true,
  bigNumberStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());
// Aumentar limites para aceitar imagens em base64 enviadas no corpo JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- ROTA DE TESTE (PING) ---
app.get(['/api/health', '/health'], async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() as now');
    const [postsCount] = await pool.query('SELECT count(*) as count FROM posts');
    res.json({ 
      status: 'ok', 
      database: 'connected (MySQL)', 
      db_time: rows[0].now,
      total_posts_in_db: postsCount[0].count,
      timestamp: new Date() 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Cache em memória para posts (evita query ao MySQL a cada request)
const postsCache = {
  data: null,
  timestamp: 0,
  TTL: 60 * 1000 // 60 segundos
};

/**
 * Converte uma imagem base64 para arquivo físico e retorna a URL pública.
 * Se já for URL, retorna sem alteração.
 */
async function migrateBase64Image(postId, base64String) {
  if (!base64String || !base64String.startsWith('data:')) return base64String;

  try {
    const matches = base64String.match(/^data:([a-zA-Z0-9+/]+\/[a-zA-Z0-9+/]+);base64,(.+)$/);
    if (!matches) return base64String;

    const mimeType = matches[1];
    const data = matches[2];
    const ext = mimeType.split('/')[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');

    const uploadsDir = path.join(__dirname, '..', 'assets', 'img', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const fileName = `post-${postId}-cover.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

    const imageUrl = `/assets/img/uploads/${fileName}`;

    // Atualizar no banco para não precisar migrar novamente
    await pool.query('UPDATE posts SET image = ? WHERE id = ?', [imageUrl, postId]);

    return imageUrl;
  } catch (e) {
    console.error(`Erro ao migrar imagem do post ${postId}:`, e.message);
    return base64String;
  }
}

// --- ROTAS DE POSTS ---

app.get(['/api/posts', '/posts'], async (req, res) => {
  const { status, limit, fields } = req.query;
  
  // Usar cache apenas para a query mais comum (todos os posts publicados, sem limit específico)
  const useCache = !limit && !fields && status === 'published';
  const now = Date.now();

  if (useCache && postsCache.data && (now - postsCache.timestamp) < postsCache.TTL) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'HIT');
    return res.json(postsCache.data);
  }

  try {
    let selectCols = '*';
    if (fields === 'summary') {
      selectCols = 'id, title, description, image, author, status, created_at, published_at';
    }

    let query = `SELECT ${selectCols} FROM posts`;
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      query += ' LIMIT ?';
      params.push(parsedLimit);
    }

    const [rows] = await pool.query(query, params);

    // Migrar imagens base64 para arquivos físicos (lazy migration)
    // Faz em background para não bloquear a resposta
    let processedRows = rows;
    if (fields === 'summary') {
      const needsMigration = rows.some(r => r.image && r.image.startsWith('data:'));
      if (needsMigration) {
        // Responder imediatamente com os dados atuais (base64)
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        res.setHeader('X-Cache', 'MISS');
        res.json(rows);

        // Migrar em background
        Promise.all(
          rows
            .filter(r => r.image && r.image.startsWith('data:'))
            .map(r => migrateBase64Image(r.id, r.image))
        ).then(() => {
          // Invalidar cache para próximo request já ter URLs
          postsCache.data = null;
          postsCache.timestamp = 0;
        }).catch(e => console.error('Erro na migração em background:', e));

        return;
      }
    }

    // Salvar no cache se for a query padrão de posts publicados
    if (useCache) {
      postsCache.data = processedRows;
      postsCache.timestamp = now;
    }

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'MISS');
    res.json(processedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get(['/api/posts/:id', '/posts/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/posts', '/posts'], upload.single('image'), async (req, res) => {
  const { title, description, content, author, status } = req.body;
  const postId = req.body.id || Date.now();

  // Determinar URL/imagem
  let imageUrl = null;
  if (req.file && req.file.buffer) {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    imageUrl = await uploadImageToCloudinary(dataUri, `post-${postId}-cover`);
  } else if (req.body.image) {
    if (req.body.image.startsWith('data:')) {
      imageUrl = await uploadImageToCloudinary(req.body.image, `post-${postId}-cover`);
    } else {
      imageUrl = req.body.image;
    }
  }

  try {
    await pool.query(
      'INSERT INTO posts (id, title, description, content, image, author, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [postId, title, description, content, imageUrl, author, status || 'draft']
    );
    
    const [newPost] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
    res.status(201).json(newPost[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(['/api/posts/:id', '/posts/:id'], upload.single('image'), async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    const existing = rows[0];
    const title = req.body.title !== undefined ? req.body.title : existing.title;
    const description = req.body.description !== undefined ? req.body.description : existing.description;
    const content = req.body.content !== undefined ? req.body.content : existing.content;
    const author = req.body.author !== undefined ? req.body.author : existing.author;
    const status = req.body.status !== undefined ? req.body.status : existing.status;
    const published_at = req.body.published_at !== undefined ? req.body.published_at : existing.published_at;
    
    let imageUrl = existing.image;
    if (req.file && req.file.buffer) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      imageUrl = await uploadImageToCloudinary(dataUri, `post-${id}-cover`) || existing.image;
    } else if (req.body.image !== undefined) {
      if (req.body.image.startsWith('data:')) {
        imageUrl = await uploadImageToCloudinary(req.body.image, `post-${id}-cover`) || existing.image;
      } else {
        imageUrl = req.body.image;
      }
    }

    await pool.query(
      'UPDATE posts SET title = ?, description = ?, content = ?, image = ?, author = ?, status = ?, published_at = ?, updated_at = NOW() WHERE id = ?',
      [title, description, content, imageUrl, author, status, published_at, id]
    );

    const [updatedPost] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    res.json(updatedPost[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete(['/api/posts/:id', '/posts/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    res.json({ message: 'Post deletado com sucesso', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Rota para upload de imagens (compatibilidade com frontend storage.upload)
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    const path = require('path');
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '..', 'assets', 'img', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const fileName = `${Date.now()}-${req.file.originalname}`.replace(/\s+/g, '_');
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    const host = req.get('host');
    const protocol = req.protocol;
    const publicUrl = `${protocol}://${host}/assets/img/uploads/${fileName}`;

    return res.json({ data: { publicUrl }, error: null });
  } catch (e) {
    console.error('Erro ao salvar upload:', e);
    return res.status(500).json({ error: e.message });
  }
});


// --- ROTAS DE HOME CONTENT ---

app.get(['/api/home-content', '/home-content'], async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    const [rows] = await pool.query('SELECT * FROM home_content');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/home-content', '/home-content'], upload.single('image'), async (req, res) => {
  const { section, title, description } = req.body;
  const imageUrl = req.body.image_url || null;

  try {
    const [result] = await pool.query(
      'INSERT INTO home_content (section, title, description, image_url, updated_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE title = ?, description = ?, image_url = ?, updated_at = NOW()',
      [section, title, description, imageUrl, title, description, imageUrl]
    );
    
    const [updatedRow] = await pool.query('SELECT * FROM home_content WHERE section = ?', [section]);
    res.json(updatedRow[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Servidor MySQL rodando em http://localhost:${port}`);
  });
}

module.exports = app;
