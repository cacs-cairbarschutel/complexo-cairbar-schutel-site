const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());
app.use(express.json());

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

// --- ROTAS DE POSTS ---

app.get(['/api/posts', '/posts'], async (req, res) => {
  const { status } = req.query;
  try {
    let query = 'SELECT * FROM posts';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
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
  const imageUrl = null; 

  try {
    const [result] = await pool.query(
      'INSERT INTO posts (id, title, description, content, image, author, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [Date.now(), title, description, content, imageUrl, author, status || 'draft']
    );
    
    const [newPost] = await pool.query('SELECT * FROM posts WHERE id = ?', [result.insertId || Date.now()]);
    res.status(201).json(newPost[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROTAS DE HOME CONTENT ---

app.get(['/api/home-content', '/home-content'], async (req, res) => {
  try {
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
