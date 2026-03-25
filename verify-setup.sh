#!/bin/bash
# Script de Verificação - Implementação Supabase

echo "=================================================="
echo "🔍 VERIFICANDO IMPLEMENTAÇÃO SUPABASE"
echo "=================================================="
echo ""

# Verificar arquivos necessários
echo "📁 Verificando arquivos criados..."
files=(
  ".env.example"
  ".gitignore"
  "supabase-init.sql"
  "SUPABASE-SETUP.md"
  "assets/js/supabase-config.js"
  "assets/js/supabase-posts.js"
  "assets/js/script-new.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (FALTANDO)"
  fi
done

echo ""
echo "📝 Verificando .env.local..."
if [ -f ".env.local" ]; then
  echo "  ✅ .env.local existe"
  if grep -q "VITE_SUPABASE_URL" .env.local; then
    echo "  ✅ VITE_SUPABASE_URL configurado"
  else
    echo "  ❌ VITE_SUPABASE_URL não encontrado"
  fi
  if grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
    echo "  ✅ VITE_SUPABASE_ANON_KEY configurado"
  else
    echo "  ❌ VITE_SUPABASE_ANON_KEY não encontrado"
  fi
else
  echo "  ⚠️  .env.local não encontrado (crie manualmente)"
fi

echo ""
echo "📜 Verificando .gitignore..."
if grep -q "\.env\.local" .gitignore; then
  echo "  ✅ .env.local está em .gitignore"
else
  echo "  ❌ .env.local NÃO está em .gitignore (PERIGOSO!)"
fi

echo ""
echo "=================================================="
echo "🎯 PRÓXIMOS PASSOS A EXECUTAR:"
echo "=================================================="
echo ""
echo "1. 📧 Criar .env.local com suas credenciais:"
echo "   VITE_SUPABASE_URL=https://seu-projeto.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=sua_chave_anonima"
echo ""
echo "2. 🗄️  Executar SQL no Supabase Dashboard:"
echo "   Copie todo o conteúdo de supabase-init.sql"
echo "   Vá para SQL Editor e execute"
echo ""
echo "3. 🔗 Atualizar index.html com scripts Supabase"
echo ""
echo "4. ✅ Testar abrindo pages/blog.html no navegador"
echo ""
echo "Para detalhes completos, leia: SUPABASE-SETUP.md"
echo ""
