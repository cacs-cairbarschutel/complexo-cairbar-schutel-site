const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Neon (PostgreSQL)
// Defina a variável de ambiente DATABASE_URL no seu servidor
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Configuração de upload de imagens (Local)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './assets/img/uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// --- ROTAS DE POSTS ---

// Listar posts publicados
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts WHERE status = $1 ORDER BY created_at DESC', ['published']);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar post (Admin)
app.post('/api/posts', upload.single('image'), async (req, res) => {
  const { title, description, content, author, status } = req.body;
  const imageUrl = req.file ? `/assets/img/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      'INSERT INTO posts (id, title, description, content, image, author, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [Date.now(), title, description, content, imageUrl, author, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROTAS DE HOME CONTENT ---

app.get('/api/home-content', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM home_content');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/home-content', upload.single('image'), async (req, res) => {
  const { section, title, description } = req.body;
  const imageUrl = req.file ? `/assets/img/uploads/${req.file.filename}` : req.body.image_url;

  try {
    const result = await pool.query(
      'INSERT INTO home_content (section, title, description, image_url, updated_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (section) DO UPDATE SET title = $2, description = $3, image_url = $4, updated_at = NOW() RETURNING *',
      [section, title, description, imageUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  });
}

module.exports = app;

