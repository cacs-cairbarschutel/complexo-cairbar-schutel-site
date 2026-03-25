/**
 * EXEMPLOS DE USO - API Supabase
 * 
 * Este arquivo mostra como usar as funções Supabase para gerenciar posts
 * Você pode copiar e colar estes exemplos no Console do navegador (F12)
 */

// ============================================================================
// 1. VERIFICAR SE SUPABASE FOI INICIALIZADO
// ============================================================================

// No console do navegador (F12):
console.log('Supabase inicializado?', window.supabaseConfig?.getSupabaseClient() !== null);

// ============================================================================
// 2. BUSCAR TODOS OS POSTS PUBLICADOS
// ============================================================================

// Simples
const postsPublicados = await window.supabasePosts.fetchPublishedPosts();
console.log('Posts publicados:', postsPublicados);

// ============================================================================
// 3. BUSCAR UM POST ESPECÍFICO
// ============================================================================

const postId = 2026031101;
const umPost = await window.supabasePosts.fetchPostById(postId);
console.log('Post encontrado:', umPost);

// ============================================================================
// 4. BUSCAR TODOS OS POSTS (INCLUINDO RASCUNHOS)
// ============================================================================

const todosPosts = await window.supabasePosts.fetchAllPosts();
console.log('Todos os posts:', todosPosts);

// ============================================================================
// 5. CRIAR UM NOVO POST
// ============================================================================

const novoPost = await window.supabasePosts.createPost({
  title: 'Meu Novo Post',
  description: 'Uma descrição interessante do post',
  content: '<p>Conteúdo do post</p>',
  image: 'https://exemplo.com/imagem.jpg', // URL ou data:image
  author: 'Meu Nome',
  status: 'draft' // ou 'published'
});

console.log('Post criado:', novoPost);

// ============================================================================
// 6. ATUALIZAR UM POST EXISTENTE
// ============================================================================

const postAtualizado = await window.supabasePosts.updatePost(2026031101, {
  title: 'Título Atualizado',
  status: 'published'
});

console.log('Post atualizado:', postAtualizado);

// ============================================================================
// 7. PUBLICAR UM POST (Mudar status para published)
// ============================================================================

await window.supabasePosts.publishPost(2026031101);
console.log('✅ Post publicado!');

// ============================================================================
// 8. DESPUBLICAR UM POST (Mudar status para draft)
// ============================================================================

await window.supabasePosts.unpublishPost(2026031101);
console.log('📝 Post voltou para rascunho!');

// ============================================================================
// 9. DELETAR UM POST
// ============================================================================

const sucesso = await window.supabasePosts.deletePost(2026031101);
if (sucesso) {
  console.log('✅ Post deletado com sucesso!');
} else {
  console.log('❌ Erro ao deletar post');
}

// ============================================================================
// 10. FAZER UPLOAD DE IMAGEM
// ============================================================================

// Primeiro, você precisa de um File object
// Exemplo: elemento <input type="file" id="imageInput">
// const fileInput = document.getElementById('imageInput');
// const file = fileInput.files[0];

// const imageUrl = await window.supabasePosts.uploadPostImage(file, 'post-123');
// console.log('URL da imagem:', imageUrl);

// ============================================================================
// 11. USAR NO SCRIPT PRINCIPAL
// ============================================================================

// As funções já estão integradas em script-new.js:
// - renderBlogIndex() busca e exibe posts publicados
// - renderAdminBlog() gerencia criação/edição/deleção
// - renderPostDetail() exibe detalhe de um post

// ============================================================================
// EXEMPLO COMPLETO: BUSCAR E EXIBIR POSTS
// ============================================================================

async function exemploCompleto() {
  try {
    // Inicializar Supabase
    await window.supabaseConfig.initSupabaseClient();
    console.log('✅ Supabase inicializado!');

    // Buscar posts publicados
    const posts = await window.supabasePosts.fetchPublishedPosts();
    console.log(`📝 Encontrados ${posts.length} posts publicados:`);
    
    posts.forEach(post => {
      console.log(`  - ${post.title} (${post.author})`);
    });

    // Buscar um post específico
    if (posts.length > 0) {
      const primeiroPost = posts[0];
      const postCompleto = await window.supabasePosts.fetchPostById(primeiroPost.id);
      console.log('Conteúdo do primeiro post:', postCompleto.content.substring(0, 100) + '...');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar exemplo
// exemploCompleto();

// ============================================================================
// EXEMPLO: CRIAR UM POST VIA FORMULÁRIO
// ============================================================================

async function criarPostDoFormulario(event) {
  event.preventDefault();

  const form = event.target;
  const dados = {
    title: form.querySelector('[name="title"]').value,
    description: form.querySelector('[name="description"]').value,
    content: form.querySelector('[name="content"]').value,
    author: form.querySelector('[name="author"]').value,
    image: form.querySelector('[name="image"]').value,
    status: 'draft'
  };

  try {
    const novoPost = await window.supabasePosts.createPost(dados);
    console.log('✅ Post criado com ID:', novoPost.id);
    
    // Limpar formulário
    form.reset();
    
    // Recarregar listagem
    // renderAdminBlog();

  } catch (error) {
    console.error('❌ Erro ao criar post:', error.message);
  }
}

// Adicionar listener ao formulário
// document.getElementById('blog-form')?.addEventListener('submit', criarPostDoFormulario);

// ============================================================================
// MONITORAR MUDANÇAS EM TEMPO REAL
// ============================================================================

async function monitorarPosts() {
  // Supabase tem Realtime, mas para simplicidade aqui
  // você pode fazer refresh periódico:
  
  setInterval(async () => {
    const posts = await window.supabasePosts.fetchPublishedPosts();
    console.log('Atualização:', new Date().toLocaleTimeString(), posts.length, 'posts');
  }, 5000); // Atualizar a cada 5 segundos
}

// monitorarPosts(); // Descomentar para ativar

// ============================================================================
// DEBUGGING
// ============================================================================

// Ver cliente Supabase
window.supabaseConfig?.getSupabaseClient();

// Ver URL e Anon Key (cuidado com segurança!)
console.log('URL:', window.supabaseConfig?.SUPABASE_URL);
// console.log('Key:', window.supabaseConfig?.SUPABASE_ANON_KEY); // NÃO imprimir em produção!

// Ver se está autenticado
const isAuth = await window.supabaseConfig?.isAuthenticated();
console.log('Autenticado?', isAuth);

// Ver usuário atual
const currentUser = await window.supabaseConfig?.getCurrentUser();
console.log('Usuário atual:', currentUser);

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/*
1. Todas as funções são ASSINCRONAMENTE, use await ou .then()
2. Sempre coloque em try/catch para tratar erros
3. O localStorage é sincronizado automaticamente como fallback
4. Imagens são salvas como data:image (Base64) ou URLs públicas
5. Para upload real de arquivos, veja supabase-posts.js uploadPostImage()
6. As policies do Supabase controlam quem pode fazer o quê
7. Em produção, configure autenticação em vez de usar chave anônima
*/
