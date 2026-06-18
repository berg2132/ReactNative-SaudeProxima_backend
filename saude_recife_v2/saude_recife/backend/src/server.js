// ============================================================
// ARQUIVO: src/server.js
// FUNÇÃO:  Ponto de entrada do servidor. Configura o Express,
//          conecta ao banco de dados e registra todas as rotas.
// ============================================================

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const CheckinController = require('./controllers/CheckinController');
const UsuarioController = require('./controllers/UsuarioController');

// Inicializa o app Express
const app = express();

// ----------------------------------------------------------
// Conecta ao banco de dados MongoDB antes de tudo
// ----------------------------------------------------------
connectDB();

// ----------------------------------------------------------
// Middlewares globais
// ----------------------------------------------------------

// Permite que o servidor leia JSON no corpo das requisições
app.use(express.json());

// Permite requisições de origens diferentes (necessário para o app mobile acessar o backend)
app.use(cors());

// ----------------------------------------------------------
// Rota de status (Health Check)
// Útil para verificar se o servidor está online
// Acesse: GET http://localhost:3333/
// ----------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    mensagem: 'API Saúde Recife v2.0 funcionando!',
    rotas: {
      'GET /checkins': 'Lista todos os check-ins',
      'GET /checkins/:id': 'Busca um check-in por ID',
      'POST /checkins': 'Cria um novo check-in com feedback',
      'DELETE /checkins/:id': 'Remove um check-in',
      'POST /usuarios': 'Cadastra um novo usuário',
      'POST /usuarios/login': 'Autentica um usuário',
      'GET /usuarios': 'Lista usuários (debug)',
    },
  });
});

// ----------------------------------------------------------
// Rotas de Usuários
// ----------------------------------------------------------
app.post('/usuarios', UsuarioController.criar);
app.post('/usuarios/login', UsuarioController.login);
app.get('/usuarios', UsuarioController.listar);

// ----------------------------------------------------------
// Rotas de Check-ins
// ----------------------------------------------------------

// GET → lista o histórico completo (critério obrigatório da avaliação)
app.get('/checkins', CheckinController.index);

// GET por ID → detalhe de um check-in específico
app.get('/checkins/:id', CheckinController.show);

// POST → salva um novo check-in com localização e feedback (critério obrigatório)
app.post('/checkins', CheckinController.create);

// DELETE → remove um check-in pelo ID
app.delete('/checkins/:id', CheckinController.delete);

// ----------------------------------------------------------
// Inicia o servidor na porta definida
// ----------------------------------------------------------
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/`);
});
