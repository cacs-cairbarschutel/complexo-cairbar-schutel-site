# 🚀 Guia de Implementação - Integração Supabase

Bem-vindo! Este guia irá ajudá-lo a configurar completamente a integração do seu site com Supabase para armazenar posts em um banco de dados profissional.

## ⚠️ SEGURANÇA PRIMEIRO

**Sua chave API foi comprometida!** Siga estes passos imediatamente:

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **Project Settings → API**
3. Clique em **Revoke** na sua chave atual
4. Clique em **Create** para gerar uma nova chave
5. **NUNCA** compartilhe sua chave em mensagens, GitHub público ou screenshots

---

## 📋 Pré-requisitos

- [ ] Conta no [Supabase](https://supabase.com) (gratuita)
- [ ] Projeto Supabase criado
- [ ] Sua nova chave de API (Anon Key)

---

## 🔧 Passo 1: Preparar o Banco de Dados

### 1.1 Executar o Script SQL

1. Abra [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor** (lado esquerdo)
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `supabase-init.sql`
6. Cole no editor SQL
7. Clique em **Run** (ícone de play)
8. Aguarde a conclusão (você verá ✅ se tudo correr bem)

### 1.2 Verificar a Criação

Na sequência do painel SQL, execute:
```sql
SELECT * FROM public.posts LIMIT 1;
```

Você deve ver 3 posts padrão inseridos!

---

## 🎯 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Obter suas credenciais Supabase

1. No Supabase Dashboard, vá para **Settings → API**
2. Copie:
   - **Project URL** (ex: `https://seu-projeto.supabase.co`)
   - **Anon Public key** (a chave pública)

### 2.2 Criar arquivo `.env.local`

Na raiz do projeto (mesmo nível que `index.html`), crie um arquivo chamado `.env.local`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

⚠️ **IMPORTANTE**: 
- Substitua pelos SEUS valores reais
- Este arquivo **NUNCA** deve ser commitado no Git
- Adicione `.env.local` ao `.gitignore`

### 2.3 Usar em Desenvolvimento Local

Se estiver testando localmente (sem frameworks como Vite):

Abra o arquivo `index.html` e adicione isto ANTES de carregar os scripts:

```html
<script>
  // Configuração temporária para desenvolvimento local
  window.__SUPABASE_URL__ = 'https://seu-projeto.supabase.co';
  window.__SUPABASE_ANON_KEY__ = 'sua_chave_anonima_aqui';
</script>
```

---

## 📦 Passo 3: Adicionar Scripts ao HTML

### 3.1 Atualizar `index.html`

Adicione os scripts ANTES de fechar a tag `</body>`:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="assets/js/supabase-config.js"></script>
<script src="assets/js/supabase-posts.js"></script>

<!-- Scripts da aplicação (NOVO) -->
<script src="assets/js/script-new.js"></script>
<!-- 
  IMPORTANTE: Se não quiser quebrar a versão antiga, mantenha:
  <script src="assets/js/script.js"></script>
  
  Mas preferencialmente, substitua por script-new.js acima
-->
```

### 3.2 Atualizar outras páginas HTML

Faça o mesmo em:
- `pages/blog.html`
- `pages/blog-post.html`
- `admin/index.html` (se existir)
- Qualquer outra página que exiba posts

---

## ✅ Passo 4: Testar a Integração

### 4.1 Teste Local

1. Abra `pages/blog.html` no navegador
2. Abra o **Console do Navegador** (F12 → Console)
3. Procure por mensagens como:
   - ✅ "Supabase inicializado com sucesso!"
   - Ou ⚠️ "Usando localStorage como fallback"

### 4.2 Verificar Posts

Se vir os 3 posts padrão na página de blog, funcionou! ✅

### 4.3 Testar Criação de Post

1. Vá para a página admin (`admin/index.html`)
2. Crie um novo post
3. Verifique no Supabase Dashboard → **Table Editor** → **posts**
4. Você deve ver seu novo post lá!

---

## 🎨 Passo 5: Estrutura de Arquivos Criados

```
complexo-cairbar-schutel-site/
├── .env.example                    # Exemplo de variáveis (commitar)
├── .env.local                      # SUAS chaves (NÃO commitar)
├── supabase-init.sql              # Script SQL do banco
├── assets/
│   └── js/
│       ├── script.js              # Original (pode deletar após testar)
│       ├── script-new.js          # NOVO - Com Supabase
│       ├── supabase-config.js     # Configuração Supabase
│       └── supabase-posts.js      # Operações CRUD de Posts
└── ...resto do projeto
```

---

## 🔄 Passo 6: Migrar de localStorage para Supabase

A integração funciona de forma **híbrida**:

- **Na primeira vez**: Busca dados do Supabase
- **Se Supabase está offline**: Usa localStorage como fallback
- **Ao salvar**: Salva em ambos (Supabase + localStorage)

### Sincronização Manual

Para sincronizar dados locais com Supabase:

```javascript
// No console do navegador
await window.supabasePosts.fetchAllPosts().then(posts => {
  console.log('Posts no Supabase:', posts);
});
```

---

## 🚀 Passo 7: Deploy/Publicação

### Para Netlify:

1. Crie um arquivo `netlify.toml` na raiz:

```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[env]
  VITE_SUPABASE_URL = "https://seu-projeto.supabase.co"
  VITE_SUPABASE_ANON_KEY = "sua_chave_anonima_aqui"
```

2. Conecte seu repositório Git ao Netlify
3. Adicione as variáveis de ambiente no **Netlify Dashboard → Site settings → Build & deploy → Environment**

### Para GitHub Pages:

Se usar GitHub Pages, configure no `.github/workflows/deploy.yml`:

```yaml
- name: Set environment variables
  run: |
    echo "VITE_SUPABASE_URL=${{ secrets.SUPABASE_URL }}" >> $GITHUB_ENV
    echo "VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}" >> $GITHUB_ENV
```

---

## 📖 Documentação da API

### Funções Disponíveis

```javascript
// Buscar posts publicados
const posts = await window.supabasePosts.fetchPublishedPosts();

// Buscar um post específico
const post = await window.supabasePosts.fetchPostById(2026031101);

// Criar novo post
const newPost = await window.supabasePosts.createPost({
  title: 'Novo Título',
  description: 'Descrição curta',
  content: 'Conteúdo completo',
  author: 'Seu Nome',
  status: 'draft'
});

// Atualizar post
await window.supabasePosts.updatePost(postId, { status: 'published' });

// Deletar post
await window.supabasePosts.deletePost(postId);

// Upload de imagem
const url = await window.supabasePosts.uploadPostImage(file, postId);
```

---

## 🛠️ Troubleshooting

### Problema: "Supabase não inicializado"

**Solução:**
1. Verifique se `.env.local` existe com valores corretos
2. Verifique se os scripts Supabase estão sendo carregados
3. Abra Console (F12) e procure por erros

### Problema: "404 Not Found"

**Solução:**
1. Verifique se a tabela `posts` foi criada no SQL
2. Execute novamente o `supabase-init.sql`

### Problema: "Unauthorized"

**Solução:**
1. Verifique se as **Policies** estão configuradas corretamente
2. As policies devem estar liberadas para leitura pública

### Problema: "Posts desapareceram após atualizar"

**Solução:**
- Isso é normal! O localStorage foi limpo
- Os dados estão no Supabase
- Recarregue a página para sincronizar

---

## 📱 Próximos Passos

1. **Autenticação de Usuários**: Implementar login/logout admin
2. **Backup Automático**: Configurar backups diários no Supabase
3. **Analytics**: Adicionar rastreamento de visualizações
4. **CDN**: Servir imagens via Cloudflare para melhor performance
5. **Email Notifications**: Notificar quando novo post é criado

---

## 💬 Suporte

Documentação Oficial:
- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript/introduction)

---

## ✨ Checklist Final

- [ ] Banco de dados criado e testado
- [ ] `.env.local` criado com variáveis corretas
- [ ] Scripts HTML atualizados
- [ ] Posts aparecem na página de blog
- [ ] Novo post pode ser criado no admin
- [ ] Posts aparecem no Supabase Dashboard
- [ ] `.env.local` adicionado ao `.gitignore`
- [ ] Chave API antiga foi revogada

Pronto! 🎉 Sua aplicação está integrada com Supabase!
