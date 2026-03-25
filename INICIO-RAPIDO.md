# ⚡ INÍCIO RÁPIDO - 30 MINUTOS

## 🎯 Objetivo
Migrar posts do seu PC para Supabase (banco de dados na nuvem).

---

## ⏱️ Passo 1: LEITURA (5 minutos)
Abra e leia estes dois arquivos:
1. `RESUMO.md` 
2. `SUPABASE-SETUP.md` (seção 1-3)

---

## 🔧 Passo 2: CONFIGURAÇÃO (5 minutos)

### 2.1 No Supabase Dashboard:
```
1. Vá para Settings → API
2. Copie: Project URL
3. Copie: Anon Public Key
```

### 2.2 Na raiz do seu projeto:
Crie arquivo `.env.local`:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

---

## 📊 Passo 3: BANCO DE DADOS (5 minutos)

### 3.1 No Supabase:
```
1. SQL Editor → New Query
2. Copie TODO o conteúdo: supabase-init.sql
3. Cole no editor SQL
4. Clique: RUN ▶️
5. Aguarde conclusão ✅
```

---

## 🔗 Passo 4: ADICIONAR SCRIPTS AO HTML (10 minutos)

### 4.1 Abra: `index.html`
Procure por `</body>` (perto do final)

Adicione ANTES dela:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
<script src="assets/js/supabase-config.js"></script>
<script src="assets/js/supabase-posts.js"></script>
<script src="assets/js/script-new.js"></script>
</body>
```

### 4.2 Faça o MESMO em:
- `pages/blog.html`
- `pages/blog-post.html`
- `admin/index.html` (se existir)

**REMOVA a linha antiga:**
```html
<!-- Remove isto: -->
<!-- <script src="assets/js/script.js"></script> -->
```

---

## ✅ Passo 5: TESTE (5 minutos)

### 5.1 No navegador:
```
1. Abra: pages/blog.html
2. Aperte F12 (abrir Console)
3. Procure por: "✅ Supabase inicializado com sucesso!"
4. Olhe para página: Posts devem aparecer
```

Se vir os posts e a mensagem de sucesso: **🎉 PRONTO!**

---

## 🎯 Pronto em 30 minutos?

```
Sim! Se você:
✅ Seguiu exatamente os passos acima
✅ Preencheu as variáveis corretamente
✅ Executou o SQL
✅ Atualizou os HTMLs
✅ Testou no navegador

Parabéns! 🚀 Está funcionando!
```

---

## ❌ Se der erro?

Consulte: `TROUBLESHOOTING.md`

---

## 📚 Documentação Completa

Para mais detalhes: `SUPABASE-SETUP.md` (páginas 1-15)

---

**Tempo Total Estimado:** 30-45 minutos

Start: Agora! 🚀
