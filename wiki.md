
# Guia de Padronização: Git & Workflow (ONG)

Este documento define as diretrizes para o desenvolvimento web, garantindo que o código seja organizado, rastreável e fácil de manter por qualquer membro da equipe.

##  1. Arquitetura de Branches

Utilizaremos o fluxo de ramificação para separar o que está "em teste" do que está "online".

| Branch | Tipo | Exemplo | Propósito |
|--------|------|---------|-----------|
| `main` | Estável | `main` | Código que já está no ar no site da ONG |
| `develop` | Integração | `develop` | União de todas as funcionalidades novas para teste |
| `feature/*` | Recurso | `feature/galeria-fotos` | Criação da seção de fotos dos eventos |
| `fix/*` | Correção | `fix/erro-envio-email` | Conserto do formulário que não dispara mensagens |
| `hotfix/*` | Urgente | `hotfix/ajuste-logo-topo` | Ajuste imediato de algo que quebrou na main |
| `docs/*` | Documentação | `docs/manual-postagem` | Escrita do guia de como a ONG deve postar notícias |

##  2. Padrão de Commits

Formato: `tipo: descrição curta`. Evite commits genéricos como "ajustes" ou "finalizado".

- **feat:** `feat: adiciona botão de doação via PIX no rodapé`
- **fix:** `fix: corrige sobreposição do menu em telas de iPhone`
- **docs:** `docs: explica como configurar a chave da API do Google Maps`
- **style:** `style: altera cor do botão primário para o azul da logo`
- **refactor:** `refactor: simplifica a função de validação de CPF`
- **chore:** `chore: instala biblioteca de ícones FontAwesome`

##  3. Fluxo de Trabalho Passo a Passo

Exemplo: criando a página "Quem Somos"

1. Atualize seu ambiente:
    ```bash
    git checkout develop
    git pull origin develop
    ```

2. Crie a branch da tarefa:
    ```bash
    git checkout -b feature/pagina-quem-somos
    ```

3. Trabalhe e commite:
    ```bash
    git add . && git commit -m "feat: cria estrutura HTML da página quem somos"
    git add . && git commit -m "style: estiliza cards da equipe com CSS Grid"
    ```

4. Envie para o GitHub:
    ```bash
    git push origin feature/pagina-quem-somos
    ```

5. Abra um Pull Request no GitHub de `feature/pagina-quem-somos` → `develop`
    - Descreva: "Esta tarefa adiciona a página institucional. Foi testado em Chrome e Safari Mobile."

##  4. Organização de Arquivos e Conteúdo

```
.
├── /assets
│   ├── /img          # Fotos, logos e ícones
│   └── /css          # Arquivos de estilo
├── /src              # Código fonte (React/Vue/PHP/HTML)
└── /docs             # Manuais em PDF ou Markdown
```

### Dica de Ouro
Sempre que terminar uma branch, abra o site no seu **celular** antes de fazer merge. Se o formulário ou layout quebrar ali, não finalize ainda!
