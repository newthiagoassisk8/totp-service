# TOTP Service

Serviço completo de gerenciamento de códigos TOTP (Time-based One-Time Password) com autenticação e isolamento por usuário.

## 🚀 Funcionalidades

- ✅ **Autenticação completa**: Registro, login, tokens com expiração
- ✅ **Gerenciamento de TOTP**: CRUD completo (Create, Read, Update, Delete)
- ✅ **Exportação/Importação**: Backup e restauração de TOTPs em JSON
- ✅ **Isolamento por usuário**: Cada usuário gerencia apenas seus próprios TOTPs
- ✅ **Segurança**: Rate limiting (120 req/min), bcrypt, CORS configurável
- ✅ **PostgreSQL**: Persistência com Drizzle ORM e índices otimizados

## 📋 Rotas Disponíveis

### Autenticação (5 rotas)
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/token` - Criar token de autenticação
- `POST /api/auth/revoke` - Revogar token
- `GET /api/auth/user` - Informações do usuário (protegido)

### TOTP (1 rota)
- `GET /api/totp` - Listar códigos TOTP gerados (protegido)

### Gerenciamento (5 rotas)
- `POST /api/management/totp` - Criar TOTP (protegido)
- `PUT/PATCH /api/management/totp` - Atualizar TOTP (protegido)
- `DELETE /api/management/totp` - Deletar TOTP (protegido)
- `GET /api/management/export` - Exportar TOTPs (protegido)
- `POST /api/management/import` - Importar TOTPs (protegido)

**Total: 12 rotas funcionais**

## 🏁 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env (copie de .env.example)
cp .env.example .env

# 3. Aplicar migrations
npm run db:migrate

# 4. Criar usuário demo
npm run db:seed

# 5. Iniciar servidor
npm run dev
```

O servidor inicia em `http://localhost:3001`

## 🧪 Testando

### Usando o token fixo do seed:
```bash
curl http://localhost:3001/api/totp \
  -H "Authorization: Bearer c8eeaabf3ef14ffc811cab37ba16753f"
```

### Script de testes completo:
```bash
./test-api.sh
```

## 📚 Documentação

- **[QUICKSTART.md](QUICKSTART.md)** - Guia rápido de início
- **[API_DOCS.md](API_DOCS.md)** - Documentação completa da API
- **[IMPLEMENTACAO.md](IMPLEMENTACAO.md)** - Detalhes técnicos da implementação
- **[UPDATE_NOTES.md](UPDATE_NOTES.md)** - Notas de atualização

## 🔑 Credenciais Padrão (Seed)

```
Email: demo@email.com
Senha: pass123
Token fixo: c8eeaabf3ef14ffc811cab37ba16753f
```

## 🛠️ Tecnologias

- **Node.js** + **TypeScript**
- **H3** - Framework HTTP minimalista
- **Drizzle ORM** - Type-safe SQL
- **PostgreSQL** - Database
- **bcryptjs** - Hash de senhas
- **totp-generator** - Geração de códigos TOTP

## 📦 Deploy

```bash
npm run build
npm run start
```

Configure as variáveis de ambiente no servidor de produção:
- `DATABASE_URL` - String de conexão PostgreSQL
- `CORS_ALLOWED_ORIGINS` - Domínios permitidos (separados por vírgula)
- `PORT` - Porta do servidor (padrão: 3001)

## 📄 Licença

MIT
