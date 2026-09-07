const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

/**
 * Gera um slug SEO a partir de um texto.
 * Ex: "Como o CACS ajuda crianças" → "como-o-cacs-ajuda-criancas"
 */
function slugify(text) {
  return String(text || '')
    .normalize('NFD')                        // decompõe acentos
    .replace(/[\u0300-\u036f]/g, '')         // remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')           // remove chars especiais
    .replace(/[\s_]+/g, '-')                 // espaços e underscores → hífen
    .replace(/-+/g, '-')                     // hífens múltiplos → um só
    .replace(/^-+|-+$/g, '');               // remove hífens nas pontas
}

/**
 * Garante que o slug seja único no banco.
 * Se já existir, acrescenta -2, -3, etc.
 */
async function uniqueSlug(pool, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const query = excludeId
      ? 'SELECT id FROM posts WHERE slug = ? AND id != ? LIMIT 1'
      : 'SELECT id FROM posts WHERE slug = ? LIMIT 1';
    const params = excludeId ? [slug, excludeId] : [slug];
    const [rows] = await pool.query(query, params);
    if (rows.length === 0) return slug;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
}

/**
 * Faz upload de uma imagem (base64 ou buffer) para o Cloudinary.
 * Retorna a URL segura ou null em caso de erro.
 */
async function uploadImageToCloudinary(source, publicId) {
  try {
    const { v2: cloudinary } = require('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'wtfqznv7',
      api_key: process.env.CLOUDINARY_API_KEY || '995523526285398',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'I4i1k7SWy9otcDoeRIXOBElGKgs',
    });
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
      selectCols = 'id, title, slug, description, image, author, status, created_at, published_at';
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

    // Salvar no cache se for a query padrão de posts publicados
    if (useCache) {
      postsCache.data = rows;
      postsCache.timestamp = now;
    }

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'MISS');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota por slug — deve vir ANTES da rota por :id para não conflitar
app.get(['/api/posts/slug/:slug', '/posts/slug/:slug'], async (req, res) => {
  const { slug } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.json(rows[0]);
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

  // Gerar slug único a partir do título
  const baseSlug = slugify(title || `post-${postId}`);
  const slug = await uniqueSlug(pool, baseSlug);

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
      'INSERT INTO posts (id, title, slug, description, content, image, author, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [postId, title, slug, description, content, imageUrl, author, status || 'draft']
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

    // Regenerar slug se o título mudou
    let slug = existing.slug;
    if (req.body.title !== undefined && req.body.title !== existing.title) {
      const baseSlug = slugify(title || `post-${id}`);
      slug = await uniqueSlug(pool, baseSlug, id);
    }
    // Gerar slug para posts antigos que ainda não têm slug
    if (!slug) {
      const baseSlug = slugify(title || `post-${id}`);
      slug = await uniqueSlug(pool, baseSlug, id);
    }
    
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
      'UPDATE posts SET title = ?, slug = ?, description = ?, content = ?, image = ?, author = ?, status = ?, published_at = ?, updated_at = NOW() WHERE id = ?',
      [title, slug, description, content, imageUrl, author, status, published_at, id]
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
    const { sections } = req.query;
    let rows;
    if (sections) {
      const keys = sections.split(',').map(s => s.trim()).filter(Boolean);
      if (keys.length) {
        const placeholders = keys.map(() => '?').join(',');
        [rows] = await pool.query(`SELECT * FROM home_content WHERE section IN (${placeholders})`, keys);
      } else {
        [rows] = await pool.query('SELECT * FROM home_content');
      }
    } else {
      [rows] = await pool.query('SELECT * FROM home_content');
    }
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

// --- ROTAS DE PÁGINAS LIVRES (site_pages) ---

// Inicializa a tabela site_pages se não existir
async function ensureSitePagesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_pages (
        id BIGINT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        content LONGTEXT,
        image VARCHAR(500),
        status ENUM('draft','published') DEFAULT 'draft',
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.error('Erro ao criar tabela site_pages:', e.message);
  }
}
ensureSitePagesTable();

// GET /api/site-pages — lista todas as páginas
app.get(['/api/site-pages', '/site-pages'], async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT id, title, slug, description, image, status, created_at, updated_at FROM site_pages';
    const params = [];
    if (status) { query += ' WHERE status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/site-pages/slug/:slug — busca página pelo slug
app.get(['/api/site-pages/slug/:slug', '/site-pages/slug/:slug'], async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM site_pages WHERE slug = ?', [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Página não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/site-pages/:id — busca página pelo id
app.get(['/api/site-pages/:id', '/site-pages/:id'], async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM site_pages WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Página não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/site-pages — criar nova página
app.post(['/api/site-pages', '/site-pages'], async (req, res) => {
  const { title, description, content, image, status } = req.body;
  const id = Date.now();
  const baseSlug = slugify(title || `pagina-${id}`);
  const slug = await uniqueSlugForPages(pool, baseSlug);
  try {
    await pool.query(
      'INSERT INTO site_pages (id, title, slug, description, content, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, slug, description || '', content || '', image || null, status || 'draft']
    );
    const [row] = await pool.query('SELECT * FROM site_pages WHERE id = ?', [id]);
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/site-pages/:id — atualizar página
app.put(['/api/site-pages/:id', '/site-pages/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM site_pages WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Página não encontrada' });
    const existing = rows[0];
    const title = req.body.title !== undefined ? req.body.title : existing.title;
    const description = req.body.description !== undefined ? req.body.description : existing.description;
    const content = req.body.content !== undefined ? req.body.content : existing.content;
    const image = req.body.image !== undefined ? req.body.image : existing.image;
    const status = req.body.status !== undefined ? req.body.status : existing.status;

    // Regenerar slug se título mudou
    let slug = existing.slug;
    if (req.body.title !== undefined && req.body.title !== existing.title) {
      slug = await uniqueSlugForPages(pool, slugify(title), id);
    }

    await pool.query(
      'UPDATE site_pages SET title = ?, slug = ?, description = ?, content = ?, image = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [title, slug, description, content, image, status, id]
    );
    const [updated] = await pool.query('SELECT * FROM site_pages WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/site-pages/:id
app.delete(['/api/site-pages/:id', '/site-pages/:id'], async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM site_pages WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Página não encontrada' });
    await pool.query('DELETE FROM site_pages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Página removida', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Slug único para site_pages (separado de posts)
async function uniqueSlugForPages(pool, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const query = excludeId
      ? 'SELECT id FROM site_pages WHERE slug = ? AND id != ? LIMIT 1'
      : 'SELECT id FROM site_pages WHERE slug = ? LIMIT 1';
    const params = excludeId ? [slug, excludeId] : [slug];
    const [rows] = await pool.query(query, params);
    if (!rows.length) return slug;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
}

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Servidor MySQL rodando em http://localhost:${port}`);
  });
}

module.exports = app;
