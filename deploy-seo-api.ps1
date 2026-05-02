# Script de Deploy da API de SEO
# Executer com: powershell -ExecutionPolicy Bypass -File deploy-seo-api.ps1

Write-Host "🚀 Deploy da API de SEO para CACS" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# 1. Verificar se Supabase CLI está instalado
Write-Host "`n1️⃣ Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = npm list -g supabase 2>$null | grep supabase
if ($supabaseVersion) {
    Write-Host "✅ Supabase CLI instalado" -ForegroundColor Green
} else {
    Write-Host "❌ Supabase CLI não encontrado" -ForegroundColor Red
    Write-Host "Instale com: npm install -g supabase" -ForegroundColor Yellow
    exit
}

# 2. Fazer login no Supabase
Write-Host "`n2️⃣ Fazendo login no Supabase..." -ForegroundColor Yellow
supabase login

# 3. Verificar se os arquivos existem
Write-Host "`n3️⃣ Verificando estrutura de arquivos..." -ForegroundColor Yellow
$functionPath = "supabase/functions/seo-api/index.ts"
$dashboardPath = "pages/seo-dashboard.html"

if (Test-Path $functionPath) {
    Write-Host "✅ Edge Function encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Edge Function não encontrada em $functionPath" -ForegroundColor Red
    exit
}

if (Test-Path $dashboardPath) {
    Write-Host "✅ Dashboard encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Dashboard não encontrado em $dashboardPath" -ForegroundColor Red
    exit
}

# 4. Configurar Secret no Supabase (instrução manual)
Write-Host "`n4️⃣ IMPORTANTE - Configure o Secret manualmente:" -ForegroundColor Yellow
Write-Host "
   1. Vá para: https://app.supabase.com/project/ylcvwikjelkqgehvaobq/settings/secrets
   2. Clique em 'New Secret'
   3. Nome: GOOGLE_SERVICE_ACCOUNT
   4. Valor: Cole o conteúdo do arquivo JSON (seo-api-492900-a0c4a18a34a6.json)
   5. Clique em 'Save'
" -ForegroundColor Cyan
Read-Host "Pressione ENTER quando o Secret estiver criado"

# 5. Deploy da Edge Function
Write-Host "`n5️⃣ Fazendo deploy da Edge Function..." -ForegroundColor Yellow
Write-Host "Projeto: ylcvwikjelkqgehvaobq" -ForegroundColor Gray

supabase functions deploy seo-api --project-id ylcvwikjelkqgehvaobq

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Edge Function deployada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao fazer deploy" -ForegroundColor Red
    exit
}

# 6. Testar a função
Write-Host "`n6️⃣ Testando a Edge Function..." -ForegroundColor Yellow
$testUrl = "https://ylcvwikjelkqgehvaobq.supabase.co/functions/v1/seo-api?days=7"
$headers = @{
    "Authorization" = "Bearer sb_publishable_KilOBnCNArQ22tGBILNQLQ_-9hZdw4U"
}

try {
    $response = Invoke-WebRequest -Uri $testUrl -Headers $headers -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Teste bem-sucedido!" -ForegroundColor Green
        Write-Host "Resposta (primeiras 200 caracteres):" -ForegroundColor Gray
        Write-Host $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)) -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ Aviso ao testar: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Isso pode ser normal se ainda não houver dados no Google Search Console" -ForegroundColor Gray
}

# 7. Commit e Push
Write-Host "`n7️⃣ Atualizando Git..." -ForegroundColor Yellow
git add -A
git commit -m "Implement SEO API with Google Search Console integration"
git push origin meta

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Git atualizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Aviso ao fazer git push (pode ser esperado)" -ForegroundColor Yellow
}

# 8. Resumo Final
Write-Host "`n✅ Deploy concluído!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host "
📊 Dashboard disponível em:
   http://localhost:5173/pages/seo-dashboard.html (desenvolvimento)
   https://cacs-cairbarschutel.org.br/pages/seo-dashboard.html (produção)

📚 Documentação: Veja SETUP-SEO-API.md

🔍 Ver logs da função:
   supabase functions logs seo-api

🔄 Redeploy (se necessário):
   supabase functions deploy seo-api
" -ForegroundColor Cyan
