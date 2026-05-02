# Proteção da pasta admin na HostGator

1. Envie o arquivo [admin/.htaccess](admin/.htaccess) para a pasta `admin` no `public_html`.
2. Crie o arquivo `.htpasswd-admin` fora da pasta pública, por exemplo em `/home/SEU_USUARIO/.htpasswd-admin`.
3. Gere o usuário e a senha do `.htpasswd` pelo cPanel ou com `htpasswd`.
4. Ajuste a linha `AuthUserFile` no [admin/.htaccess](admin/.htaccess) para o caminho real do seu servidor.
5. Verifique abrindo diretamente [admin/painel.html](admin/painel.html): o navegador deve pedir autenticação antes de carregar a página.

Observação: isso protege o acesso direto ao painel no nível da hospedagem. O Supabase continua responsável apenas pelos dados do site.