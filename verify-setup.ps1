# Verificação de Configuração Supabase - Windows PowerShell
# Execute este script na raiz do projeto para verificar se tudo está configurado

Write-Host "=================================================="
Write-Host "🔍 VERIFICANDO IMPLEMENTAÇÃO SUPABASE"
Write-Host "=================================================="
Write-Host ""

# Verificar arquivos necessários
Write-Host "📁 Verificando arquivos criados..."
$files = @(
    ".env.example",
    ".gitignore",
    "supabase-init.sql",
    "SUPABASE-SETUP.md",
    "assets/js/supabase-config.js",
    "assets/js/supabase-posts.js",
    "assets/js/script-new.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file"
    } else {
        Write-Host "  ❌ $file (FALTANDO)"
    }
}

Write-Host ""
Write-Host "📝 Verificando .env.local..."
if (Test-Path ".env.local") {
    Write-Host "  ✅ .env.local existe"
    
    $content = Get-Content ".env.local"
    
    if ($content -match "VITE_SUPABASE_URL") {
        Write-Host "  ✅ VITE_SUPABASE_URL configurado"
    } else {
        Write-Host "  ❌ VITE_SUPABASE_URL não encontrado"
    }
    
    if ($content -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "  ✅ VITE_SUPABASE_ANON_KEY configurado"
    } else {
        Write-Host "  ❌ VITE_SUPABASE_ANON_KEY não encontrado"
    }
} else {
    Write-Host "  ⚠️  .env.local não encontrado (crie manualmente)"
}

Write-Host ""
Write-Host "📜 Verificando .gitignore..."
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore"
    if ($gitignore -match "\.env\.local") {
        Write-Host "  ✅ .env.local está em .gitignore"
    } else {
        Write-Host "  ⚠️  .env.local NÃO está em .gitignore (adicione!)"
    }
} else {
    Write-Host "  ⚠️  .gitignore não encontrado"
}

Write-Host ""
Write-Host "=================================================="
Write-Host "✨ ARQUIVO SUPABASE-SETUP.md"
Write-Host "=================================================="
Write-Host ""
Write-Host "Abra em seu editor: SUPABASE-SETUP.md"
Write-Host "Este arquivo contém o guia completo de implementação."
Write-Host ""
Write-Host "📋 Checklist Rápido:"
Write-Host "  1. Criar .env.local com suas credenciais Supabase"
Write-Host "  2. Executar supabase-init.sql no Supabase Dashboard"
Write-Host "  3. Atualizar index.html com scripts Supabase"
Write-Host "  4. Testar abrindo pages/blog.html no navegador"
Write-Host "  5. Abrir Console (F12) para verificar se inicializou"
Write-Host ""
Write-Host "✅ Pronto!"
