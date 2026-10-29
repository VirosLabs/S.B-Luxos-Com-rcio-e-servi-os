# S.B Luxos

Site React com API Node.js, organizados em MVC, e persistência MySQL via `DATABASE_URL`.

## Executar

1. Instale as dependências com `npm.cmd install` (Windows) ou `npm install`.
2. Preencha `server/.env` com a URL da base de dados MySQL e confirme `CLIENT_ORIGIN`.
3. Configure `client/.env` com o endereço público da API e as rotas do frontend.
4. Execute `npm.cmd run db:migrate` (Windows) ou `npm run db:migrate` para criar/atualizar o esquema.
5. Execute `npm.cmd run dev` (Windows) ou `npm run dev`. O frontend abre em `http://localhost:5173` e a API em `http://localhost:3001`.
6. Aceda a `/admin` e crie a primeira conta de administrador com e-mail e senha (mínimo de 12 caracteres). Na conta antiga, use `sbluxoscomercioeservicoso@gmail.com` e a senha já configurada.

Copie `server/.env.example` para `server/.env` e `client/.env.example` para `client/.env` se ainda não existirem. Não publique nem partilhe o `server/.env`: contém as credenciais privadas da base de dados. Codifique caracteres especiais do utilizador ou da senha na URL.

Exemplo de URL local: `mysql://utilizador:senha@localhost:3306/sb_luxos`. O serviço MySQL deve estar ativo e a base de dados já deve existir. Para conexões TLS, use `mysqls://` ou acrescente `?ssl=true` à URL.

## Docker

O Docker Compose executa a aplicaÃ§Ã£o num container e monta `server/uploads` diretamente, para reutilizar as imagens e vÃ­deos existentes e conservar os novos ficheiros carregados pelo painel. A base de dados continua a ser a indicada por `DATABASE_URL` em `server/.env`; este Compose nÃ£o cria nem migra uma base de dados MySQL separada. As migraÃ§Ãµes existentes sÃ£o aplicadas automaticamente quando a aplicaÃ§Ã£o inicia.

1. Instale o Docker Desktop e inicie o Docker.
2. Copie `server/.env.example` para `server/.env` e configure `DATABASE_URL` para a base de dados que pretende usar.
3. Copie `.env.example` para `.env`. Para executar localmente, os valores predefinidos sÃ£o suficientes; para publicar com um domÃ­nio, defina `CLIENT_ORIGIN` com a origem HTTPS do site.
4. Execute `docker compose up --build -d` na pasta do projeto. O site ficarÃ¡ disponÃ­vel em `http://localhost:3001` por predefiniÃ§Ã£o.

Para ver os registos, execute `docker compose logs -f app`. Para parar a aplicaÃ§Ã£o, execute `docker compose down`; os uploads continuam na pasta `server/uploads`. A imagem exclui os ficheiros `.env`, a base de dados legada local e os uploads do contexto de build.

## Estrutura

- `client/src/models`: chamadas à API.
- `client/src/controllers`: estado e ações da aplicação.
- `client/src/views`: site público e painel de administração.
- `server/src/models`: conteúdo e credenciais persistidos no MySQL.
- `server/src/controllers`: lógica das operações HTTP.
- `server/src/routes`: encaminhamento para os controladores.
- `server/src/middleware`: proteção da área administrativa.
- `server/src/migrations`: migrações SQL versionadas.
- `server/src/database`: pool MySQL e executor de migrações.

As migrações criam `site_content`, `admin_accounts` e `schema_migrations`. O conteúdo inicial do antigo `server/data/site-content.json` é importado para o MySQL na primeira leitura, sem substituir conteúdo já guardado. A migração `003` remove apenas a galeria de imagens de referência criada originalmente por este site; fotos reais não são apagadas. As migrações `005`–`007` adicionam e-mail e suporte a múltiplos administradores; a conta antiga mantém a senha e passa a usar `sbluxoscomercioeservicoso@gmail.com` como e-mail de acesso. Depois da migração, a base de dados é a fonte de verdade. As migrações são executadas explicitamente com `npm run db:migrate` e automaticamente no arranque da API.

No painel, adicione fotografias aos próprios serviços e à galeria de trabalhos; selecione os ficheiros diretamente no computador ou informe uma URL. Também é possível carregar vídeos MP4/WebM/MOV ou usar links HTTPS do YouTube/Vimeo. As imagens aceites são JPEG/PNG/WebP/GIF/AVIF até 15 MB, e os vídeos têm limite de 150 MB. Os ficheiros carregados ficam em `server/uploads`; não são armazenados dentro da base de dados. Faça cópia de segurança dessa pasta junto com a base de dados.

No painel, cada lista de conteúdo (serviços, galeria e vídeos) tem o seu próprio botão **Guardar alterações**. Em **Definições**, cada grupo de edição tem um botão de gravação próprio para guardar imagens, contactos ou textos daquela secção sem publicar os outros rascunhos. Os textos públicos, as imagens do destaque, da apresentação e do convite, os rótulos do cabeçalho, formulário e rodapé e os contactos podem ser alterados; imagens também podem ser carregadas do computador.

As confirmações e falhas são apresentadas em notificações toast. Erros técnicos ou detalhes devolvidos pela API não são expostos ao visitante; a interface apresenta apenas uma mensagem genérica para tentar novamente.

O backend usa CORS com as origens configuradas em `server/.env`; os caminhos da API são configuráveis nos dois `.env` e os nomes das variáveis do frontend começam com `VITE_`. Cada administrador inicia sessão com e-mail e senha, guardada como hash com salt na tabela `admin_accounts`. Na secção **Administradores**, pode adicionar contas com senhas de pelo menos 12 caracteres e remover outras contas; não é possível remover a própria conta em uso nem a última conta. As sessões têm duração fixa de oito horas, sem renovação automática, e são invalidadas ao reiniciar o servidor. Configure `ADMIN_ACCOUNTS_ROUTE` e `VITE_ADMIN_ACCOUNTS_ROUTE` para personalizar a rota de gestão de contas.
