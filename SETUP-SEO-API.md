# 🔧 Guia de Configuração - API de SEO Google Search Console

Este guia explica como configurar e fazer deploy da Edge Function que integra dados do Google Search Console.

## 📋 Pré-requisitos

- Conta no Supabase (já existente: `ylcvwikjelkqgehvaobq`)
- Supabase CLI instalado: `npm install -g supabase`
- Arquivo de credenciais Google Service Account JSON (já temos)
- Git configurado

## 🔐 Passo 1: Armazenar credenciais de forma segura

### ⚠️ NUNCA commit o arquivo JSON com credenciais!

O arquivo `seo-api-492900-a0c4a18a34a6.json` já foi adicionado ao `.gitignore`.

### Adicione o Secret no Supabase Dashboard:

1. Vá para [Supabase Dashboard](https://app.supabase.com)
2. Selecione o projeto `complexo-cairbar-schutel-site`
3. Navegue para **Project Settings → Secrets**
4. Clique em **New Secret**
5. Nome: `GOOGLE_SERVICE_ACCOUNT`
6. Valor: Cole **todo o conteúdo** do arquivo JSON (incluindo quebras de linha)
7. Clique em **Save**

✅ Agora o secret está seguro e acessível à Edge Function!

## 📦 Passo 2: Deploy da Edge Function

### Opção A: Via Supabase CLI (Recomendado)

```bash
# Fazer login no Supabase
supabase login

# No diretório do projeto
cd complexo-cairbar-schutel-site

# Deploy a função
supabase functions deploy seo-api

# Teste a função
curl -X GET "https://ylcvwikjelkqgehvaobq.supabase.co/functions/v1/seo-api?days=7" \
  -H "Authorization: Bearer sb_publishable_KilOBnCNArQ22tGBILNQLQ_-9hZdw4U"
```

### Opção B: Via Supabase Dashboard

1. Vá para **Functions** no dashboard
2. Clique em **Create Function**
3. Nome: `seo-api`
4. Cole o conteúdo de `supabase/functions/seo-api/index.ts`
5. Clique em **Deploy**

## 🌐 Passo 3: Acessar o Dashboard

O dashboard está disponível em:

```
http://localhost:8000/pages/seo-dashboard.html (desenvolvimento)
https://cacs-cairbarschutel.org.br/pages/seo-dashboard.html (produção)
```

## 📊 API da Edge Function

### URL Base
```
https://ylcvwikjelkqgehvaobq.supabase.co/functions/v1/seo-api
```

### Parâmetros Query

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `site` | string | `https://cacs-cairbarschutel.org.br` | URL do site |
| `days` | integer | `30` | Número de dias no passado |
| `dimension` | string | `query` | Dimensão: `query`, `page`, `country`, `device` |

### Exemplos de Requisição

```bash
# Últimos 7 dias, por query
curl "https://ylcvwikjelkqgehvaobq.supabase.co/functions/v1/seo-api?days=7&dimension=query" \
  -H "Authorization: Bearer sb_publishable_KilOBnCNArQ22tGBILNQLQ_-9hZdw4U"

# Últimos 90 dias, por página
curl "https://ylcvwikjelkqgehvaobq.supabase.co/functions/v1/seo-api?days=90&dimension=page" \
  -H "Authorization: Bearer sb_publishable_KilOBnCNArQ22tGBILNQLQ_-9hZdw4U"

# Por dispositivo
curl "https://ylcvwikjelkqgehvaobq.supabase.co/functions/v1/seo-api?dimension=device" \
  -H "Authorization: Bearer sb_publishable_KilOBnCNArQ22tGBILNQLQ_-9hZdw4U"
```

### Resposta de Sucesso

```json
{
  "kind": "webmasters#searchAnalyticsQueryResponse",
  "responseAggregationType": "byProperty",
  "rows": [
    {
      "keys": ["palavra-chave"],
      "clicks": 42,
      "impressions": 1200,
      "ctr": 0.035,
      "position": 5.2
    }
  ]
}
```

## 🐛 Troubleshooting

### Error: "GOOGLE_SERVICE_ACCOUNT secret não configurado"
- ✅ Verifique se o secret foi criado no Supabase
- ✅ Confirme o nome exato: `GOOGLE_SERVICE_ACCOUNT`
- ✅ Redeploy a função: `supabase functions deploy seo-api`

### Error: "Google API Error"
- ✅ Verifique se o site está verificado no Google Search Console
- ✅ Confirme se há dados disponíveis no período selecionado
- ✅ Verifique as permissões da Service Account

### Function retorna 403
- ✅ Verifique o token de autenticação (Bearer token)
- ✅ Confirme se a função foi deployada
- ✅ Verifique os logs: `supabase functions logs seo-api`

## 📝 Monitoramento

### Ver logs da função
```bash
supabase functions logs seo-api --limit 100
```

### Observar logs em tempo real
```bash
supabase functions logs seo-api --follow
```

## 🔄 Atualización Automática

O dashboard atualiza os dados automaticamente a cada 5 minutos. Para forçar uma atualização manual, clique no botão **"Atualizar dados"**.

## 📚 Estrutura de Arquivos

```
complexo-cairbar-schutel-site/
├── supabase/
│   ├── config.json                      # Configuração do Supabase
│   └── functions/
│       └── seo-api/
│           └── index.ts                 # Edge Function principal
├── pages/
│   └── seo-dashboard.html              # Dashboard de visualização
├── assets/
│   └── js/
│       └── seo-dashboard.js            # Script do dashboard
├── .gitignore                          # Produzir arquivos JSON de credenciais
└── .env.example                        # Variáveis de configuração (template)
```

## ✅ Checklist de Deploy

- [ ] Secret `GOOGLE_SERVICE_ACCOUNT` criado no Supabase
- [ ] Edge Function deployada: `seo-api`
- [ ] Dashboard acessível em `/pages/seo-dashboard.html`
- [ ] Dados aparecem no dashboard
- [ ] Auto-atualização funcionando

## 🔗 Recursos Úteis

- [Documentação Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Google Search Console API](https://developers.google.com/webmaster-tools/search-console-api)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)

---

**⚠️ SEGURANÇA:** Nunca compartilhe o arquivo JSON de credenciais. Sempre use Secrets do Supabase!
