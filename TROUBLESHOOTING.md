# 🔧 Troubleshooting - Problemas Comuns

Encontrou um problema? Procure aqui pelas soluções!

---

## ❌ Problema: "Supabase não inicializado"

### 🔍 Sintomas:
- Console mostra: "Supabase não inicializado"
- Posts não aparecem
- Painel admin não funciona

### ✅ Soluções:

**1. Verifique se os scripts estão no HTML**
```html
<!-- Procure por estas 4 linhas no index.html/blog.html -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="assets/js/supabase-config.js"></script>
<script src="assets/js/supabase-posts.js"></script>
<script src="assets/js/script-new.js"></script>
```

**2. Verifique a ORDEM dos scripts**
```
❌ ERRADO:
<script src="script-new.js"></script>      <!-- Carrega antes do Supabase! -->
<script src="supabase-config.js"></script>

✅ CORRETO:
<script src="supabase-config.js"></script>
<script src="supabase-posts.js"></script>
<script src="script-new.js"></script>
```

**3. Verificar Console do navegador:**
```javascript
// Abra F12 → Console e execute:
window.supabaseConfig?.getSupabaseClient()
// Se retornar null, significa não inicializou
```

**4. Verificar Network Tab (F12 → Network)**
```
Procure por:
□ supabase-config.js (200 OK?)
□ supabase-posts.js (200 OK?)
□ script-new.js (200 OK?)

Se aparecer 404, o caminho está errado!
```

---

## ❌ Problema: "VITE_SUPABASE_URL undefined"

### 🔍 Sintomas:
- Console mostra erro de variáveis não definidas
- "Cannot read property 'createClient' of undefined"

### ✅ Soluções:

**1. Verificar se `.env.local` existe**
```bash
# Procure na RAIZ do projeto um arquivo chamado:
.env.local

# Se não existir, CRIE com conteúdo:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

**2. Verificar se as variáveis estão corretas**
```bash
# Abra .env.local e confirme:
VITE_SUPABASE_URL=https://xxxxx.supabase.co  # Começa com https://
VITE_SUPABASE_ANON_KEY=xxxxx_xxxxxxxxxxxxxxx  # Chave longa
```

**3. Para desenvolvimento local (sem .env)**
```html
<!-- Adicione no topo do index.html, ANTES dos scripts Supabase: -->
<script>
  window.__SUPABASE_URL__ = 'https://seu-projeto.supabase.co';
  window.__SUPABASE_ANON_KEY__ = 'sua_chave_anonima';
</script>
```

**4. Relogar a página**
- F5 para refresh (hard refresh: Ctrl+Shift+R)
- Feche completamente e reabra o navegador

---

## ❌ Problema: "Posts não aparecem"

### 🔍 Sintomas:
- Página de blog vazia
- Mensagem "Nenhum post encontrado"
- Admin mostra lista vazia

### ✅ Soluções:

**1. Verifique se Supabase inicializou**
```javascript
// Console (F12):
console.log('Supabase OK?', window.supabaseConfig?.getSupabaseClient() !== null)
```

**2. Verifique se a tabela `posts` existe**
- Abra Supabase Dashboard
- Table Editor → procure por `posts`
- Se não existir, execute `supabase-init.sql`

**3. Verifique se há dados na tabela**
```
Supabase Dashboard:
→ Table Editor
→ posts
→ Deve ter 3 posts padrão
```

**4. Verifique se está buscando corretamente**
```javascript
// Console:
const posts = await window.supabasePosts.fetchPublishedPosts()
console.log('Posts encontrados:', posts)
```

**5. Se está vazio, insira dados**
```sql
-- No SQL Editor do Supabase:
SELECT * FROM posts;
-- Se retornar vazio, execute supabase-init.sql novamente
```

---

## ❌ Problema: "Erro 401 Unauthorized"

### 🔍 Sintomas:
- "Invalid API Key"
- "Unauthorized"
- Forbidden access

### ✅ Soluções:

**1. Verificar chave de API**
```bash
# Abra .env.local:
VITE_SUPABASE_ANON_KEY=xxxxxxxx

# Compare com Supabase Dashboard:
Settings → API → Anon Public key
# Devem ser IGUAIS (cópia exata!)
```

**2. Verificar policies RLS**
```
Supabase Dashboard:
→ Authentication → Policies
→ Tabela 'posts'
→ Deve ter 2 policies:
   □ "Allow public read published posts"
   □ "Allow authenticated full access"
```

**3. Verificar se chave está revogada**
```
Supabase Dashboard:
→ Settings → API
→ Procure se a chave está REVOKED
→ Se estiver, gere uma NOVA chave
```

**4. Copiou a chave CERTA?**
```
TENHO 2 CHAVES NO SUPABASE:
❌ NUNCA USE: API Service Role Secret Key (privada!)
✅ USE: Anon Public Key (pública, segura para web)
```

---

## ❌ Problema: "Table does not exist"

### 🔍 Sintomas:
- "ERROR: relation \"public.posts\" does not exist"
- "Table not found"

### ✅ Soluções:

**1. A tabela não foi criada**

Execute `supabase-init.sql`:
```
1. Supabase Dashboard
2. SQL Editor → New Query
3. Copie TODO o conteúdo de: supabase-init.sql
4. Cole no editor
5. Clique RUN
6. Aguarde a conclusão ✅
```

**2. Verifique se foi criada**
```sql
-- No SQL Editor:
SELECT * FROM information_schema.tables 
WHERE table_name = 'posts';

-- Deve retornar 1 linha (a tabela posts)
```

**3. Verifique erros de SQL**
```
Se vir ❌ erro ao executar:
→ Leia a mensagem de erro
→ Procure por syntax errors
→ Copie a linha exata do erro em SUPABASE-SETUP.md → Troubleshooting
```

---

## ❌ Problema: "Erro ao fazer upload de imagem"

### 🔍 Sintomas:
- "Storage bucket not found"
- "File upload failed"
- Imagem não salva

### ✅ Soluções:

**1. Bucket não foi criado**

Execute esta query SQL no Supabase:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts-images', 'posts-images', true)
ON CONFLICT (id) DO NOTHING;
```

**2. Verifique permissões**
```
Supabase Dashboard:
→ Storage → Buckets
→ Clique em 'posts-images'
→ Policies → Deve ter 3 policies
```

**3. Imagens como Data URL (temporário)**

Por enquanto, as imagens são salvas como Base64:
```javascript
// Isso funciona:
await window.supabasePosts.createPost({
  image: 'data:image/png;base64,iVBORw0KG...' // Data URL
})
```

Para upload real de arquivos em Storage, consulte `supabase-posts.js` função `uploadPostImage()`.

---

## ❌ Problema: "Mudei de computador e posts sumiram"

### 🔍 Sintomas:
- Antes os posts estavam no navegador
- Agora em outro PC não aparecem
- "Nenhum post encontrado"

### ✅ Soluções:

**Isso é NORMAL e esperado! 🎉**

**ANTES:** Posts estavam em `localStorage` (só naquele navegador)
**AGORA:** Posts estão em Supabase (sincronizados globalmente)

```
ANTES:              AGORA:
PC 1 → Posts 1      Supabase ← PC 1 (acessa os mesmos posts)
PC 2 → Vazio               ← PC 2 (acessa os mesmos posts)
      (sem posts)

Benefício: todos veem os mesmos posts!
```

---

## ❌ Problema: "Erro de CORS"

### 🔍 Sintomas:
- "Access to XMLHttpRequest blocked by CORS policy"
- Requests bloqueadas

### ✅ Soluções:

**1. CORS é configurado automaticamente pelo Supabase**

Se ainda assim tiver erro:

**2. Verifique URL do Supabase**
```bash
# .env.local deve ter URL EXATA:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# NÃO: supabase.co (sem https://)
# NÃO: https://seu-projeto.supabase.co/ (sem trailing slash)
```

**3. Aguarde Supabase carregar**
```javascript
// Página pode carregar antes do Supabase inicializar
// Adicione delay:
await new Promise(r => setTimeout(r, 1000));
await window.supabasePosts.fetchPublishedPosts();
```

---

## ❌ Problema: "localStorage conflicts with Supabase"

### 🔍 Sintomas:
- Posts duplicados
- Dados inconsistentes entre navegadores
- Versões antigas dos posts aparecem

### ✅ Soluções:

**1. Limpar localStorage**
```javascript
// Console (F12):
localStorage.clear()
// Recarregue a página (F5)
```

**2. Sincronizar dados**
```javascript
// Console:
// Buscar do Supabase e atualizar localStorage
const posts = await window.supabasePosts.fetchAllPosts();
localStorage.setItem('posts', JSON.stringify(posts));
```

**3. Desabilitar fallback localStorage** (avançado)

Em `script-new.js`, mude:
```javascript
USE_SUPABASE = true;  // Força sempre usar Supabase
```

---

## ✅ Teste de Diagnóstico Rápido

Cole isto no Console (F12) para verificar tudo:

```javascript
// Teste completo
async function diagnose() {
  console.log('=== DIAGNÓSTICO SUPABASE ===');
  
  // 1. Supabase Client
  const client = window.supabaseConfig?.getSupabaseClient();
  console.log('✓ Supabase Client:', client !== null ? '✅' : '❌');
  
  // 2. Posts Function
  console.log('✓ Posts API:', typeof window.supabasePosts?.fetchPublishedPosts === 'function' ? '✅' : '❌');
  
  // 3. Fetching Posts
  try {
    const posts = await window.supabasePosts.fetchPublishedPosts();
    console.log('✓ Posts Fetched:', posts.length > 0 ? `✅ (${posts.length} posts)` : '❌ (0 posts)');
  } catch(e) {
    console.log('✗ Posts Error:', e.message);
  }
  
  // 4. Storage
  console.log('✓ localStorage:', 'posts' in localStorage ? '✅' : '⚠️ vazio');
  
  console.log('=== FIM DIAGNÓSTICO ===');
}

diagnose();
```

---

## 📞 Se Nada Funcionar

### Checklist Final:

- [ ] Executou `supabase-init.sql` no Supabase?
- [ ] Criou `.env.local` com suas credenciais?
- [ ] Verificou grafia de `.env.local` (case-sensitive)?
- [ ] Adicionou scripts ao HTML na ordem correta?
- [ ] Fez hard refresh (Ctrl+Shift+R)?
- [ ] Abriu Console (F12) e viu erros?
- [ ] A tabela `posts` existe em Supabase?

### Próximos Passos:

1. Abra Console (F12 → Console)
2. Execute o `diagnose()` acima
3. Copie os resultados
4. Procure neste documento por seu erro
5. Se ainda não resolver, consulte:
   - `SUPABASE-SETUP.md` → Troubleshooting
   - [Supabase Docs](https://supabase.com/docs)
   - Console de erros (F12)

---

**Boa sorte! 🚀**  
A maioria dos problemas são simples de resolver!
