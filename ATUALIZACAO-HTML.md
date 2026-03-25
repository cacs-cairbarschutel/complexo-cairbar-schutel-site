# 📝 Guia de Atualização - Arquivos HTML

Saiba exatamente o que adicionar em cada arquivo HTML para integrar Supabase.

---

## 🚀 Arquivo Principal: `index.html`

Abra seu `index.html` e procure pela tag `</body>` (perto do final do arquivo).

Antes de `</body>`, adicione:

```html
<!-- ========== SCRIPTS SUPABASE ========== -->
<!-- Biblioteca do Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>

<!-- Configuração do Supabase -->
<script src="assets/js/supabase-config.js"></script>

<!-- Funções CRUD de Posts -->
<script src="assets/js/supabase-posts.js"></script>

<!-- Script Principal com Supabase Integrado -->
<script src="assets/js/script-new.js"></script>
<!-- ========== FIM SCRIPTS SUPABASE ========== -->
</body>
```

### ⚠️ Se você tinha `<script src="assets/js/script.js"></script>`

**Opção 1 (Recomendado)**: Remova a linha antiga e use `script-new.js` acima

```html
<!-- REMOVA ESTA LINHA: -->
<!-- <script src="assets/js/script.js"></script> -->

<!-- USE ESTA NO LUGAR: -->
<script src="assets/js/script-new.js"></script>
```

**Opção 2**: Mantenha ambos (mas use o novo)

```html
<!-- Manter compatibilidade -->
<!-- <script src="assets/js/script.js"></script> -->

<!-- Usar o novo com Supabase -->
<script src="assets/js/script-new.js"></script>
```

---

## 📄 Arquivo: `pages/blog.html`

1. Procure por `<script src="../assets/js/script.js"></script>` (perto do final)

2. **Antes** dessa linha, adicione:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="../assets/js/supabase-config.js"></script>
<script src="../assets/js/supabase-posts.js"></script>
```

3. **Substitua** a línha antiga:

```html
<!-- ANTES: -->
<!-- <script src="../assets/js/script.js"></script> -->

<!-- DEPOIS: -->
<script src="../assets/js/script-new.js"></script>
```

---

## 📄 Arquivo: `pages/blog-post.html`

Equal ao `blog.html`, adicione ANTES da tag `</body>`:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="../assets/js/supabase-config.js"></script>
<script src="../assets/js/supabase-posts.js"></script>
<script src="../assets/js/script-new.js"></script>
```

---

## 📄 Arquivo: `admin/index.html` (painel admin)

Se existir painel admin, adicione os mesmos scripts:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="../assets/js/supabase-config.js"></script>
<script src="../assets/js/supabase-posts.js"></script>
<script src="../assets/js/script-new.js"></script>
</body>
```

---

## 📄 Outras Páginas HTML

Se tiver outras páginas que exibem posts, adicione:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="assets/js/supabase-config.js"></script>
<script src="assets/js/supabase-posts.js"></script>
<script src="assets/js/script-new.js"></script>
```

Ajuste o caminho `assets/` conforme necessário.

---

## ✅ Checklist para Cada HTML

Para cada arquivo HTML que contém posts:

- [ ] Encontrei a tag `</body>`
- [ ] Adicionei `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>`
- [ ] Adicionei `<script src="...supabase-config.js"></script>`
- [ ] Adicionei `<script src="...supabase-posts.js"></script>`
- [ ] Adicionei `<script src="...script-new.js"></script>`
- [ ] Removi ou comentei o `script.js` antigo
- [ ] Salvei o arquivo

---

## 🧪 Como Testar

1. Abra qualquer página HTML que foi atualizada
2. Abra o Console (F12 ou Ctrl+Shift+J)
3. Procure por uma das mensagens:
   - ✅ "Supabase inicializado com sucesso!"
   - ⚠️ "Supabase indisponível... Usando localStorage como fallback"

Se nenhuma mensagem aparecer, significa que algo está faltando!

---

## 🔗 Ordem Correta dos Scripts

**IMPORTANTE:** Os scripts devem estar nesta ordem:

```html
1️⃣ <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
2️⃣ <script src="assets/js/supabase-config.js"></script>
3️⃣ <script src="assets/js/supabase-posts.js"></script>
4️⃣ <script src="assets/js/script-new.js"></script>
</body>
```

Se mudar a ordem, pode não funcionar!

---

## 📋 Template Pronto

Copie e cole isto antes de `</body>`:

```html
    <!-- ========== SUPABASE INTEGRATION ========== -->
    <!-- CDN Supabase Library -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
    
    <!-- Supabase Configuration -->
    <script src="assets/js/supabase-config.js"></script>
    
    <!-- Supabase Posts CRUD -->
    <script src="assets/js/supabase-posts.js"></script>
    
    <!-- Main Application Script -->
    <script src="assets/js/script-new.js"></script>
    <!-- ========== FIM SUPABASE ========== -->
</body>
```

**Nota:** Ajuste `assets/js/` para `../assets/js/` se o HTML estiver em subpastas.

---

## ❓ Dúvidas Frequentes

**P: O que acontece se esquecer de adicionar um script?**  
R: Você verá erros no Console sobre funções não definidas (e.g., "window.supabasePosts is undefined")

**P: Preciso remover o script.js antigo?**  
R: Não obrigatoriamente, mas é recomendado para evitar conflitos.

**P: E se usar um framework como Vue/React?**  
R: Os scripts ainda funcionam, mas você pode querer modificar a importação dinâmica.

**P: Para páginas sem posts (ex: sobre, contato)?**  
R: Não precisa adicionar os scripts Supabase lá, mas não faz mal adicionar.

---

## 🎯 Próximo Passo

Depois de atualizar todos os HTMLs:

1. Teste abrindo `pages/blog.html` no navegador
2. Verifique no Console (F12) por mensagens de inicialização
3. Procure pelos posts padrão na página
4. Tente criar um novo post no admin

Se tudo funcionar, 🎉 você está pronto!

---

**Dúvida?** Consulte `SUPABASE-SETUP.md` para guia completo.
