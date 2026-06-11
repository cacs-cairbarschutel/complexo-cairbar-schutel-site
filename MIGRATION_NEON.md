# Guia de Migração: Supabase para Neon PostgreSQL

Este documento descreve como concluir a migração do CACS para o Neon PostgreSQL, eliminando a dependência do Supabase.

## 1. Banco de Dados (Neon)

Você já tem o arquivo `clean_dump.sql`. Para importar no Neon:

1. Crie um novo projeto no [Neon.tech](https://neon.tech).
2. Obtenha a Connection String (ex: `postgres://alex:pass@ep-host.region.aws.neon.tech/neondb`).
3. No terminal, execute:
   ```bash
   psql "SUA_CONNECTION_STRING" < clean_dump.sql
   ```

## 2. Hospedagem Permanente (Vercel)

O projeto está configurado para deploy automático na **Vercel**. 

1. Conecte seu repositório GitHub na Vercel.
2. Nas configurações do projeto (Environment Variables), adicione:
   - `DATABASE_URL`: Sua Connection String do Neon.
3. A Vercel usará o arquivo `vercel.json` para servir os arquivos estáticos e rodar o backend em `backend/server.js` automaticamente.

## 3. Substituindo o Storage (Imagens)

O Supabase Storage deve ser substituído por:
1. **Local:** Salvar imagens na pasta `assets/img/uploads/` do próprio servidor (se usar VPS).
2. **S3/Cloudflare R2:** Recomendado para escalabilidade.

## 4. Próximos Passos no Código

1. **Remover Supabase SDK:** Remova a tag `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>` dos arquivos HTML.
2. **Atualizar Configuração:** Edite `assets/js/supabase-config.js` para usar `fetch()` para o seu novo backend em vez do cliente Supabase.
3. **Migrar Auth:** Como você usa um sistema de senha fixa no frontend (`admin-access.js`), a migração é simples, pois não depende do Supabase Auth para a lógica básica, apenas para persistir dados se as RLS exigissem.

---

### Verificações Necessárias:
- [ ] Importar `clean_dump.sql` sem erros.
- [ ] Testar a nova API de posts.
- [ ] Configurar o novo local de upload de imagens.
