## Scouting API - Guia de Execução (Passo a passo)

Este documento explica como preparar o ambiente, instalar dependências, configurar o banco e executar a API localmente.

### Pré-requisitos
- .NET SDK 9.0 (ou superior 9.x)
  - Verifique: `dotnet --info`
  - Download: https://dotnet.microsoft.com/download
- PostgreSQL 13+ (recomendado 14+)
  - Ter um banco criado com as credenciais abaixo (padrão do projeto):
    - Host: localhost
    - Porta: 5432
    - Database: scoutingdb
    - Usuário: postgres
    - Senha: postgres
  - Opcional: pgAdmin para gerenciar o banco
- Git (opcional, para clonar o repositório)

### Recursos mínimos (máquina de desenvolvimento)
- CPU: 2 vCPUs
- Memória RAM: 2 GB (recomendado 4 GB)
- Disco: ~500 MB livres (SDK .NET, pacotes NuGet, binários e banco local)
- SO: Windows 10/11, macOS, ou Linux (qualquer distro com suporte ao .NET)

### Clonar o projeto (opcional)
```
git clone <url-do-repo>
cd scouting
```

### Configuração de feeds NuGet (se necessário)
Há um `nuget.config` na raiz apontando para o NuGet oficial. Caso sua máquina tenha um feed corporativo que cause erros de restore, mantenha este arquivo como está.

### Configurar a connection string
O projeto já vem com a connection string padrão no arquivo `ScoutingApi/appsettings.json`:
```
"ConnectionStrings": {
  "Default": "Host=localhost;Port=5432;Database=scoutingdb;Username=postgres;Password=postgres"
}
```
Você pode sobrescrever via variável de ambiente (recomendado em produção):
- PowerShell (Windows):
```
$env:ConnectionStrings__Default="Host=localhost;Port=5432;Database=scoutingdb;Username=postgres;Password=postgres"
```
- Bash (Linux/macOS):
```
export ConnectionStrings__Default="Host=localhost;Port=5432;Database=scoutingdb;Username=postgres;Password=postgres"
```

### Restaurar pacotes
```
dotnet restore
```

### Atualizar as ferramentas do EF Core (recomendado)
Se você tiver uma versão antiga do `dotnet-ef`, atualize:
```
dotnet tool update -g dotnet-ef
```

### Criar estrutura do banco
As migrações já foram adicionadas. Para aplicar ao banco (criar tabelas):
```
dotnet ef database update --project ScoutingApi
```
Observação: certifique-se de que o PostgreSQL está em execução e acessível com a connection string configurada.

### Executar a API
- Opção 1 (porta dinâmica padrão):
```
dotnet run --project ScoutingApi
```
- Opção 2 (porta fixa):
```
dotnet run --project ScoutingApi --urls http://localhost:5180
```


### Testar rapidamente
- Swagger UI: acesse `http://localhost:<porta>/swagger`
- Health check: `http://localhost:<porta>/health`

### Endpoints CRUD principais
- Usuarios: `GET/POST/PUT/DELETE /api/Usuarios`
- Clubes: `GET/POST/PUT/DELETE /api/Clubes`
- Jogadores: `GET/POST/PUT/DELETE /api/Jogadores`
- Histórico de Clubes: `GET/POST/PUT/DELETE /api/HistoricoClubes`
- Avaliações: `GET/POST/PUT/DELETE /api/Avaliacoes`
- Vídeos: `GET/POST/PUT/DELETE /api/Videos`
- Relatórios: `GET/POST/PUT/DELETE /api/Relatorios`
- Lesões: `GET/POST/PUT/DELETE /api/Lesoes`

Exemplo (PowerShell) para criar um usuário:
```
$body = @{ nome="Admin"; email="admin@exemplo.com"; senha="senha123"; perfil="A" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:5180/api/Usuarios" -ContentType 'application/json' -Body $body
```

### Dicas e resolução de problemas
- Erro ao restaurar pacotes por feed corporativo: mantenha `nuget.config` apontando para `https://api.nuget.org/v3/index.json`.
- Erro de conexão com o banco: valide host/porta/usuário/senha e se o serviço PostgreSQL está ativo.
- Certificado HTTPS no dev: caso use HTTPS e veja avisos, instale o certificado de desenvolvimento do .NET:
```
dotnet dev-certs https --trust
```
- Ferramentas EF antigas x runtime novo: atualize com `dotnet tool update -g dotnet-ef`.
- Serialização de datas: o projeto usa `DateOnly` para algumas colunas; isso é suportado pelo Npgsql/EF Core 9.

### Scripts úteis
- Build: `dotnet build`
- Limpar: `dotnet clean`
- Executar: `dotnet run --project ScoutingApi`
- Aplicar migrações: `dotnet ef database update --project ScoutingApi`
- Criar nova migração (se o modelo mudar):
```
dotnet ef migrations add <NomeDaMigracao> --project ScoutingApi
```

### Frontend (Angular)

Pré-requisitos
- Node.js 18+ (recomendado 20/22)
- npm 9+

A aplicação fica em `ScountingFrontend/` (Angular 20, TypeScript, SCSS, routing, standalone components).

Como rodar em desenvolvimento
1) Inicie o backend em http://localhost:5180
```
dotnet run --project ScoutingApi --urls http://localhost:5180
```
2) Instale as dependências e suba o frontend com proxy para o backend
```
npm ci --prefix ScountingFrontend  # ou `npm install --prefix ScountingFrontend`
npm run start --prefix ScountingFrontend
```
- Abre em http://localhost:4200/login
- O arquivo `ScountingFrontend/proxy.conf.json` redireciona `/api` para `http://localhost:5180`
- Se a porta 4200 estiver em uso: `npm run start --prefix ScountingFrontend -- --port 4300`

Cadastro e login
- Cadastro pela UI em `/register` (envia `POST /api/Usuarios` com { nome, email, senha, perfil })
- Login pela UI em `/login` (envia `POST /api/auth/login` com { email, senha })
- O token (temporário) é salvo em `localStorage`; o botão “Sair” limpa a sessão e redireciona para o login

Build de produção
```
npm run build --prefix ScountingFrontend
```
Saída em `ScountingFrontend/dist/`.

### Estrutura do projeto
- `ScoutingApi/` Projeto ASP.NET Core (.NET 9)
  - `Models/` Entidades do domínio
  - `Data/` DbContext e mapeamentos
  - `Controllers/` Endpoints REST
  - `Migrations/` Migrações do EF Core
  - `appsettings*.json` Configurações
- `ScountingFrontend/` Aplicação Angular
  - `src/app/services/api.service.ts` chamada ao backend (`/api/health`)
  - `src/app/components/health/health.component.ts` componente de demo de status
  - `proxy.conf.json` proxy de dev para o backend

### Próximos passos (sugestões)
- Autenticação/Autorização (JWT, hashing de senha, etc.)
- Validações e DTOs para requests/responses
- Versionamento de API
- Logs estruturados e observabilidade
- Testes automatizados (unitários e integração)

