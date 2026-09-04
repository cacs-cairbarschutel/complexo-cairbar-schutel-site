/**
 * migrate-slugs.js
 *
 * Executa duas operações no banco MySQL:
 *   1. Adiciona a coluna `slug` à tabela `posts` (se ainda não existir).
 *   2. Gera e salva o slug para todos os posts que ainda não têm um.
 *
 * Como usar:
 *   node scripts/migrate-slugs.js
 *
 * Requer o arquivo .env na raiz do projeto com as credenciais do banco.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// ─── Slugify ────────────────────────────────────────────────────────────────

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(conn, baseSlug, excludeId) {
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const [rows] = await conn.query(
      'SELECT id FROM posts WHERE slug = ? AND id != ? LIMIT 1',
      [slug, excludeId]
    );
    if (rows.length === 0) return slug;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
}

// ─── Migração ────────────────────────────────────────────────────────────────

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('✅ Conectado ao banco MySQL.');

  // 1. Adicionar coluna slug se não existir
  try {
    await conn.query(`
      ALTER TABLE posts
        ADD COLUMN slug VARCHAR(255) NULL UNIQUE
          AFTER title
    `);
    console.log('✅ Coluna `slug` adicionada à tabela posts.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Coluna `slug` já existe. Pulando criação.');
    } else {
      throw err;
    }
  }

  // 2. Buscar posts sem slug
  const [posts] = await conn.query(
    'SELECT id, title FROM posts WHERE slug IS NULL OR slug = ""'
  );

  if (posts.length === 0) {
    console.log('✅ Todos os posts já possuem slug. Nada a fazer.');
    await conn.end();
    return;
  }

  console.log(`📋 ${posts.length} post(s) sem slug encontrado(s). Gerando...`);

  let updated = 0;
  for (const post of posts) {
    const base = slugify(post.title || `post-${post.id}`);
    const slug = await uniqueSlug(conn, base, post.id);
    await conn.query('UPDATE posts SET slug = ? WHERE id = ?', [slug, post.id]);
    console.log(`  ✔ [${post.id}] "${post.title}" → "${slug}"`);
    updated++;
  }

  console.log(`\n✅ Migração concluída. ${updated} post(s) atualizado(s).`);
  await conn.end();
}

run().catch((err) => {
  console.error('❌ Erro na migração:', err.message);
  process.exit(1);
});
