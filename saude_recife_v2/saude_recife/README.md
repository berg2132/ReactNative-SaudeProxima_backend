# 🏥 Saúde Próxima — Backend

API REST desenvolvida em **Node.js + Express + MongoDB** para o aplicativo de Unidades de Saúde do Recife. Gerencia autenticação de usuários e registro de check-ins com avaliações e feedbacks.

---

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Executando o Servidor](#executando-o-servidor)
- [Docker](#docker)
- [Rotas da API](#rotas-da-api)
- [Modelos de Dados](#modelos-de-dados)
- [Estrutura de Pastas](#estrutura-de-pastas)

---

## 🛠 Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | ^4.18.2 | Framework HTTP |
| Mongoose | ^7.5.0 | ODM para MongoDB |
| CORS | ^2.8.5 | Cross-Origin Resource Sharing |
| Nodemon | ^3.0.1 | Hot-reload em desenvolvimento |
| MongoDB | 7 | Banco de dados |

---

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [MongoDB](https://www.mongodb.com/) rodando localmente na porta `27017` **ou** uma URI remota (Atlas, Render, Railway etc.)
- npm (já incluso no Node.js)

---

## 🚀 Instalação

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Instale as dependências
npm install
```

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz da pasta `backend/` com as seguintes variáveis:

```env
# URI do MongoDB (padrão: instância local)
MONGO_URI=mongodb://127.0.0.1:27017/saudeRecifeDB

# Porta do servidor (padrão: 3333)
PORT=3333
```

> Se nenhuma variável for definida, o servidor usará os valores padrão acima.

---

## ▶️ Executando o Servidor

### Desenvolvimento (com hot-reload)

```bash
npm run dev
```

### Produção

```bash
npm start
```

O servidor estará disponível em `http://localhost:3333`.

Acesse `GET http://localhost:3333/` para confirmar que está rodando:

```json
{
  "status": "online",
  "mensagem": "API Saúde Recife v2.0 funcionando!"
}
```

---

## 🐳 Docker

O projeto inclui um `docker-compose.yml` que sobe o **backend + MongoDB** juntos com um único comando.

```bash
# Na raiz do projeto (onde está o docker-compose.yml)
docker-compose up
```

Isso irá:
- Subir um container MongoDB na porta `27017` com persistência de dados em volume.
- Subir o backend na porta `3333`, já apontando para o MongoDB interno.

Para parar:
```bash
docker-compose down
```

---

## 📡 Rotas da API

### Health Check

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Verifica se o servidor está online |

---

### Usuários

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/usuarios` | Cadastra um novo usuário |
| `POST` | `/usuarios/login` | Autentica um usuário |
| `GET` | `/usuarios` | Lista todos os usuários (uso admin/debug) |

#### `POST /usuarios` — Cadastro

**Body:**
```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "minhasenha123"
}
```

**Resposta (201):**
```json
{
  "_id": "64f...",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "dataCadastro": "2024-01-01T00:00:00.000Z"
}
```

---

#### `POST /usuarios/login` — Login

**Body:**
```json
{
  "email": "maria@email.com",
  "senha": "minhasenha123"
}
```

**Resposta (200):**
```json
{
  "_id": "64f...",
  "nome": "Maria Silva",
  "email": "maria@email.com"
}
```

---

### Check-ins

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/checkins` | Lista todos os check-ins (do mais recente ao mais antigo) |
| `GET` | `/checkins/:id` | Busca um check-in por ID |
| `POST` | `/checkins` | Registra um novo check-in com feedback |
| `DELETE` | `/checkins/:id` | Remove um check-in |

#### `POST /checkins` — Criar Check-in

**Body:**
```json
{
  "localNome": "US 221 - PSF ILHA DE JOANEIRO",
  "latitudeUsuario": -8.063,
  "longitudeUsuario": -34.871,
  "distrito": "DS I",
  "area": "EQUIPE I",
  "telefone": "(81) 3355-0000",
  "avaliacao": 4,
  "feedback": "Atendimento rápido e profissionais atenciosos."
}
```

Campos obrigatórios: `localNome`, `latitudeUsuario`, `longitudeUsuario`.

**Resposta (201):**
```json
{
  "_id": "64f...",
  "localNome": "US 221 - PSF ILHA DE JOANEIRO",
  "latitudeUsuario": -8.063,
  "longitudeUsuario": -34.871,
  "distrito": "DS I",
  "area": "EQUIPE I",
  "telefone": "(81) 3355-0000",
  "avaliacao": 4,
  "feedback": "Atendimento rápido e profissionais atenciosos.",
  "dataRegistro": "2024-01-01T00:00:00.000Z"
}
```

---

## 🗃 Modelos de Dados

### Usuario

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `nome` | String | ✅ | — |
| `email` | String | ✅ | Único, lowercase |
| `senha` | String | ✅ | Mín. 6 caracteres. ⚠️ Em produção, usar bcrypt |
| `dataCadastro` | Date | — | Preenchido automaticamente |

### Checkin

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `localNome` | String | ✅ | Nome da unidade de saúde |
| `latitudeUsuario` | Number | ✅ | Capturado pelo GPS |
| `longitudeUsuario` | Number | ✅ | Capturado pelo GPS |
| `distrito` | String | — | Padrão: `"Não informado"` |
| `area` | String | — | Padrão: `"Não informado"` |
| `telefone` | String | — | Padrão: `"Não informado"` |
| `avaliacao` | Number | — | Entre 1 e 5. Padrão: `null` |
| `feedback` | String | — | Máx. 500 caracteres |
| `dataRegistro` | Date | — | Preenchido automaticamente |

---

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Conexão com o MongoDB
│   ├── controllers/
│   │   ├── CheckinController.js   # Lógica das rotas de check-in
│   │   └── UsuarioController.js   # Lógica das rotas de usuário
│   ├── models/
│   │   ├── Checkin.js         # Schema do check-in
│   │   └── Usuario.js         # Schema do usuário
│   └── server.js              # Ponto de entrada: configura Express e rotas
├── package.json
└── .env                       # (criar manualmente — não versionado)
```

---

## ⚠️ Observações de Segurança (Produção)

- **Senhas em texto puro:** atualmente as senhas são salvas sem criptografia. Antes de ir para produção, implemente o [bcrypt](https://www.npmjs.com/package/bcryptjs) no `UsuarioController`.
- **Autenticação por JWT:** o endpoint de login retorna apenas os dados do usuário. Implemente tokens JWT para proteger rotas privadas.
- **Rota `GET /usuarios`:** expõe a lista de usuários. Em produção, proteja com middleware de autenticação.
