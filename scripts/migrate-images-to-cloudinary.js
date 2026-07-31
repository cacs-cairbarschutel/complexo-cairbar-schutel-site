/**
 * Script de migração: converte imagens base64 do banco para URLs do Cloudinary.
 *
 * O que faz:
 * - Lê todos os posts do banco MySQL
 * - Para cada post com image em base64, faz upload para o Cloudinary
 * - Para cada post com content contendo <img src="data:..."> também migra
 * - Atualiza os campos image e content no banco com as URLs resultantes
 *
 * Uso:
 *   node scripts/migrate-images-to-cloudinary.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'wtfqznv7',
  api_key: '995523526285398',
  api_secret: 'I4i1k7SWy9otcDoeRIXOBElGKgs',
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  supportBigNumbers: true,
  bigNumberStrings: true,
  waitForConnections: true,
  connectionLimit: 5,
});

/**
 * Faz upload de um base64 para o Cloudinary e retorna a URL segura.
 */
async function uploadToCloudinary(base64String, publicId) {
  const result = await cloudinary.uploader.upload(base64String, {
    public_id: publicId,
    folder: 'cacs-blog',
    overwrite: true,
    resource_type: 'image',
  });
  return result.secure_url;
}

/**
 * Substitui todas as imagens base64 dentro de um HTML pelo URL do Cloudinary.
 */
async function migrateContentImages(postId, html) {
  if (!html) return { changed: false, html };

  const regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
  const matches = [...html.matchAll(regex)];

  if (matches.length === 0) return { changed: false, html };

  let updatedHtml = html;
  let index = 0;

  for (const match of matches) {
    const base64 = match[1];
    const publicId = `post-${postId}-content-${index++}`;
    try {
      console.log(`    ↳ Migrando imagem de conteúdo ${index} (${Math.round(base64.length / 1024)}KB)...`);
      const url = await uploadToCloudinary(base64, publicId);
      updatedHtml = updatedHtml.replace(base64, url);
      console.log(`    ✅ ${url}`);
    } catch (e) {
      console.error(`    ❌ Erro ao migrar imagem de conteúdo ${index}:`, e.message);
    }
  }

  return { changed: true, html: updatedHtml };
}

async function migrate() {
  console.log('🚀 Iniciando migração de imagens para o Cloudinary...\n');

  const [posts] = await pool.query('SELECT id, title, image, content FROM posts');
  console.log(`📋 ${posts.length} posts encontrados no banco.\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    console.log(`\n📝 [${post.id}] ${post.title}`);

    let newImage = post.image;
    let newContent = post.content;
    let changed = false;

    // Migrar campo image
    if (post.image && post.image.startsWith('data:')) {
      console.log(`  📸 Migrando imagem de capa (${Math.round(post.image.length / 1024)}KB)...`);
      try {
        newImage = await uploadToCloudinary(post.image, `post-${post.id}-cover`);
        console.log(`  ✅ ${newImage}`);
        changed = true;
      } catch (e) {
        console.error(`  ❌ Erro ao migrar imagem de capa:`, e.message);
        errorCount++;
      }
    } else {
      console.log(`  ⏭️  Imagem de capa já é URL, pulando.`);
    }

    // Migrar imagens dentro do content
    if (post.content && post.content.includes('data:image')) {
      console.log(`  📄 Migrando imagens do conteúdo...`);
      try {
        const result = await migrateContentImages(post.id, post.content);
        if (result.changed) {
          newContent = result.html;
          changed = true;
        }
      } catch (e) {
        console.error(`  ❌ Erro ao migrar conteúdo:`, e.message);
        errorCount++;
      }
    }

    // Atualizar banco se houve mudanças
    if (changed) {
      try {
        await pool.query(
          'UPDATE posts SET image = ?, content = ?, updated_at = NOW() WHERE id = ?',
          [newImage, newContent, post.id]
        );
        console.log(`  💾 Banco atualizado.`);
        migratedCount++;
      } catch (e) {
        console.error(`  ❌ Erro ao atualizar banco:`, e.message);
        errorCount++;
      }
    } else {
      skippedCount++;
    }
  }

  console.log('\n========================================');
  console.log(`✅ Migrados:  ${migratedCount} posts`);
  console.log(`⏭️  Pulados:   ${skippedCount} posts (já tinham URLs)`);
  console.log(`❌ Erros:     ${errorCount}`);
  console.log('========================================\n');

  await pool.end();
}

migrate().catch((err) => {
  console.error('❌ Erro fatal na migração:', err);
  process.exit(1);
});
