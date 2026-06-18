// ============================================================
// ARQUIVO: src/controllers/UsuarioController.js
// FUNÇÃO:  Lógica de negócio para cadastro e login de usuários.
//
//  ROTAS IMPLEMENTADAS:
//    POST /usuarios          → cadastra um novo usuário
//    POST /usuarios/login    → autentica e retorna os dados
//    GET  /usuarios          → lista todos (uso admin/debug)
// ============================================================

const Usuario = require('../models/Usuario');

module.exports = {

  // ==========================================================
  // ROTA POST /usuarios
  // Cria um novo usuário. Em produção, a senha deveria ser
  // criptografada com bcrypt antes de salvar.
  // ==========================================================
  async criar(req, res) {
    try {
      const { nome, email, senha } = req.body;

      // Validação básica dos campos obrigatórios
      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
      }

      // Verifica se já existe um usuário com esse e-mail
      const emailExistente = await Usuario.findOne({ email });
      if (emailExistente) {
        return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
      }

      // Cria o usuário (ATENÇÃO: em produção, usar bcrypt na senha!)
      const novoUsuario = await Usuario.create({ nome, email, senha });

      // Retorna o usuário criado sem a senha por segurança
      return res.status(201).json({
        _id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        dataCadastro: novoUsuario.dataCadastro,
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ erro: 'Falha ao cadastrar usuário.' });
    }
  },

  // ==========================================================
  // ROTA POST /usuarios/login
  // Autentica o usuário verificando e-mail e senha.
  // Em produção, usar JWT para retornar um token de sessão.
  // ==========================================================
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
      }

      // Busca o usuário pelo e-mail
      const usuario = await Usuario.findOne({ email });

      // Se não encontrou ou a senha não bate, retorna erro genérico (segurança)
      if (!usuario || usuario.senha !== senha) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
      }

      // Retorna os dados do usuário sem expor a senha
      return res.status(200).json({
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ erro: 'Falha ao fazer login.' });
    }
  },

  // ==========================================================
  // ROTA GET /usuarios
  // Lista todos os usuários cadastrados (útil para debug).
  // Em produção, esta rota deve ser protegida por autenticação.
  // ==========================================================
  async listar(req, res) {
    try {
      // Retorna todos os usuários, omitindo as senhas
      const usuarios = await Usuario.find().select('-senha');
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ erro: 'Falha ao buscar usuários.' });
    }
  },
};
