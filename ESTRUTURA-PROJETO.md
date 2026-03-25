# 📂 Estrutura de Projeto Completa + Supabase

Visualização de toda a estrutura do seu projeto com os novos arquivos integrados.

## 🌳 Árvore do Projeto

```
complexo-cairbar-schutel-site/
│
├── 📄 DOCUMENTAÇÃO SUPABASE
│   ├── RESUMO.md                    ⭐ Leia primeiro!
│   ├── SUPABASE-SETUP.md           ⭐⭐ Guia Completo
│   ├── ATUALIZACAO-HTML.md         ⭐ Como atualizar HTML
│   ├── ARQUIVOS-CRIADOS.md         📋 Overview
│   ├── EXEMPLOS-API.js             💻 Exemplos de código
│   └── .env.example                🔐 Variáveis de ambiente
│
├── 🔧 CONFIGURAÇÃO
│   ├── supabase-init.sql           📊 Schema do banco de dados
│   ├── .env.local                  🔐 [CRIAR VOCÊ] - NÃO COMMITAR
│   ├── .gitignore                  🚫 Arquivo para ignorar no Git
│   └── verify-setup.ps1            ✅ Script de verificação (Windows)
│
├── 📄 ARQUIVOS PRINCIPAIS
│   ├── index.html                  [ATUALIZAR - adicionar scripts]
│   ├── CNAME
│   ├── README.md
│   ├── wiki.md
│   └── package.json (opcional)
│
├── 📁 /admin/
│   ├── config.yml                  (Netlify CMS config)
│   └── index.html                  [ATUALIZAR - adicionar scripts]
│
├── 📁 /assets/
│   ├── /css/
│   │   └── style.css
│   │
│   ├── /img/
│   │   └── [imagens do site]
│   │
│   └── /js/
│       ├── ✨ NOVO: supabase-config.js      🔧 Configuração
│       ├── ✨ NOVO: supabase-posts.js       🔧 CRUD Operations
│       ├── ✨ NOVO: script-new.js           ⭐ Script Principal
│       └── script.js                (Original - pode remover)
│
├── 📁 /financeiro/
│   └── doacao.html                 [ATUALIZAR se necessário]
│
├── 📁 /pages/
│   ├── acolhimento.html
│   ├── bilingue.html
│   ├── blog.html                   [ATUALIZAR - adicionar scripts]
│   ├── blog-post.html              [ATUALIZAR - adicionar scripts]
│   ├── blog-post-1.html
│   ├── blog-post-2.html
│   ├── blog-post-3.html
│   ├── blog.html
│   ├── cacs.html
│   ├── cdi.html
│   ├── doacao.html
│   ├── florescer.html
│   ├── nfp.html
│   └── voluntario.html
│
└── 📁 /posts/
    ├── 2025-01-15-voluntariado-em-foco/
    ├── 2025-02-06-saude-bem-estar-cdi/
    └── 2025-03-21-acoes-que-transformam/
    (estes são locais - podem ser deletados após migração)
```

---

## 🎯 Arquivos que VOCÊ PRECISA ATUALIZAR

### 1. `index.html` 🔴
**O que fazer:**
- Procure por `</body>`
- Adicione scripts Supabase ANTES de `</body>`

**Adicionar:**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="assets/js/supabase-config.js"></script>
<script src="assets/js/supabase-posts.js"></script>
<script src="assets/js/script-new.js"></script>
```

---

### 2. `pages/blog.html` 🔴
**O que fazer:**
- Procure por `</body>`
- Remova ou comente `<script src="../assets/js/script.js"></script>`
- Adicione scripts Supabase

**Remover:**
```html
<!-- <script src="../assets/js/script.js"></script> -->
```

**Adicionar:**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="../assets/js/supabase-config.js"></script>
<script src="../assets/js/supabase-posts.js"></script>
<script src="../assets/js/script-new.js"></script>
```

---

### 3. `pages/blog-post.html` 🔴
**Mesmo que blog.html acima**

---

### 4. `admin/index.html` 🔴
**Se existir painel admin, mesmo processo**

---

### 5. Outras páginas (opcional)
Se tiver posts em outras páginas, adicione os scripts.

---

## 🔐 Arquivo que VOCÊ DEVE CRIAR

### `.env.local` 🔴 IMPORTANTE
```bash
# Na RAIZ do projeto (mesmo nível que index.html)
# Copie e preencha com SEUS valores

VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

⚠️ **NUNCA COMMITAR ESTE ARQUIVO!**  
Está no `.gitignore` automaticamente.

---

## 📊 Banco de Dados (Supabase)

### Tabela Criada: `posts`

```sql
CREATE TABLE posts (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  author TEXT DEFAULT 'Equipe CACS',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  slug TEXT UNIQUE,
  tags TEXT[]
);
```

### Storage Bucket: `posts-images`
Para armazenar imagens dos posts.

---

## 🚀 Ordem de Execução

```
1️⃣  Ler RESUMO.md (visão geral)
    ↓
2️⃣  Ler SUPABASE-SETUP.md (passo-a-passo)
    ↓
3️⃣  Criar .env.local com suas credenciais
    ↓
4️⃣  Executar supabase-init.sql no Supabase
    ↓
5️⃣  Ler ATUALIZACAO-HTML.md
    ↓
6️⃣  Atualizar index.html
    ↓
7️⃣  Atualizar pages/blog.html
    ↓
8️⃣  Atualizar pages/blog-post.html
    ↓
9️⃣  Atualizar outras páginas se necessário
    ↓
🔟 Testar abrindo pages/blog.html (F12)
    ↓
✅ Sucesso! Posts aparecem do Supabase
```

---

## 📝 Scripts Adicionados ao HTML

```html
<!-- CDN Supabase (obtém biblioteca do browser) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>

<!-- Seu código: Configura cliente Supabase -->
<script src="assets/js/supabase-config.js"></script>

<!-- Seu código: Operações CRUD (Create, Read, Update, Delete) -->
<script src="assets/js/supabase-posts.js"></script>

<!-- Seu código: Script principal integrado com Supabase -->
<script src="assets/js/script-new.js"></script>
```

---

## ✅ Verificação Final

Depois de atualizar, verifique:

```javascript
// No Console (F12):

// 1. Supabase foi inicializado?
window.supabaseConfig?.getSupabaseClient() !== null
// Deve retornar: true

// 2. Funções de posts disponíveis?
typeof window.supabasePosts.fetchPublishedPosts === 'function'
// Deve retornar: true

// 3. Listar posts
await window.supabasePosts.fetchPublishedPosts()
// Deve mostrar: array de posts
```

---

## 📞 Se Algo Não Funcionar

```
❌ "supabasePosts is undefined"
   → Faltam scripts Supabase em algum arquivo

❌ "VITE_SUPABASE_ANON_KEY is undefined"
   → Faltam variáveis em .env.local

❌ "Table posts does not exist"
   → Não executou supabase-init.sql

❌ "Invalid API Key"
   → .env.local tem valor errado

✅ Veja "Troubleshooting" em SUPABASE-SETUP.md
```

---

## 🎯 Resumo Visual

```
ANTES                          DEPOIS
├─ localStorage                ├─ Supabase ☁️
├─ Um navegador               ├─ Qualquer lugar
├─ Sem backup                 ├─ Backup automático
├─ Arquivo locais             ├─ Banco de dados profissional
└─ Lento                       └─ Rápido com CDN
```

---

## 📚 Documentos em Ordem de Leitura

1. **RESUMO.md** (este é o overview visual)
2. **SUPABASE-SETUP.md** ⭐ (leia isso inteiro!)
3. **ATUALIZACAO-HTML.md** (saiba exatamente o que mudar)
4. **EXEMPLOS-API.js** (copie e teste no console)
5. **.env.example** (crie seu .env.local baseado nisso)

---

**Pronto para começar?**  
👉 Abra `SUPABASE-SETUP.md` agora!
