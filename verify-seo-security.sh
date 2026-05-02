#!/bin/bash
# Script para verificar a segurança da configuração de SEO API

echo "🔐 Verificação de Segurança - API de SEO"
echo "======================================"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ✅ Verificar se o arquivo JSON está no .gitignore
echo -e "\n📋 Verificando .gitignore..."

if grep -q "seo-api-.*\.json" .gitignore; then
    echo -e "${GREEN}✅ Arquivo JSON está no .gitignore${NC}"
else
    echo -e "${RED}❌ AVISO: Arquivo JSON pode ser commitado!${NC}"
    echo "Adicione 'seo-api-*.json' ao .gitignore"
fi

if grep -q "google-service-account.json" .gitignore; then
    echo -e "${GREEN}✅ google-service-account.json está no .gitignore${NC}"
else
    echo -e "${RED}❌ AVISO: google-service-account.json pode ser commitado!${NC}"
fi

# ✅ Verificar se há JSON no repositório
echo -e "\n🔍 Procurando por arquivos JSON sensíveis..."

JSON_FILES=$(find . -name "*.json" -path "*.json" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./supabase/*" 2>/dev/null)

if [ -z "$JSON_FILES" ]; then
    echo -e "${GREEN}✅ Nenhum arquivo JSON sensível encontrado${NC}"
else
    echo -e "${YELLOW}⚠️ Arquivos JSON encontrados:${NC}"
    echo "$JSON_FILES"
fi

# ✅ Verificar se o commit anterior contém JSON
echo -e "\n📊 Verificando histórico de commits..."

if git log --all --pretty=format: --name-only | grep -E "seo-api.*\.json|google-service-account\.json" | head -1; then
    echo -e "${RED}❌ CRÍTICO: Credenciais foram commitadas!${NC}"
    echo "Você precisa remover do histórico do Git:"
    echo "  git filter-branch --tree-filter 'rm -f seo-api-*.json' -- --all"
else
    echo -e "${GREEN}✅ Nenhuma credencial no histórico de commits${NC}"
fi

# ✅ Verificar permissões de arquivo
echo -e "\n🔒 Verificando permissões..."

if [ -f "seo-api-492900-a0c4a18a34a6.json" ]; then
    PERMS=$(ls -l "seo-api-492900-a0c4a18a34a6.json" | awk '{print $1}')
    echo "Permissões do arquivo: $PERMS"
    
    if [[ "$PERMS" == *"rw"* ]]; then
        echo -e "${YELLOW}⚠️ O arquivo tem permissões de leitura/escrita${NC}"
    fi
fi

# ✅ Verificar se as credenciais estão no Supabase Secrets
echo -e "\n🔑 Verificando Supabase Secrets..."
echo "Para verificar manualmente:"
echo "  1. Vá para: https://app.supabase.com/project/ylcvwikjelkqgehvaobq/settings/secrets"
echo "  2. Procure por 'GOOGLE_SERVICE_ACCOUNT'"
echo "  3. Se não existir, crie-o com o conteúdo do JSON"

# ✅ Verificar se os arquivos da API existem
echo -e "\n📦 Verificando estrutura de arquivos..."

REQUIRED_FILES=(
    "supabase/functions/seo-api/index.ts"
    "pages/seo-dashboard.html"
    "assets/js/seo-dashboard.js"
    "supabase/config.json"
    "SETUP-SEO-API.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (não encontrado)"
    fi
done

# ✅ Resumo
echo -e "\n📋 RESUMO"
echo "======================================"
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "  1. NUNCA commit o arquivo JSON"
echo "  2. Configure o Secret no Supabase"
echo "  3. Faça deploy da Edge Function"
echo "  4. Teste com: supabase functions logs seo-api"
echo ""
echo "📚 Para mais detalhes, veja SETUP-SEO-API.md"
