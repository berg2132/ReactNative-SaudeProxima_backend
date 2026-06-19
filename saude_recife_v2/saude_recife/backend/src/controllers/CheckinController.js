// ============================================================
// ARQUIVO: src/controllers/CheckinController.js
// FUNÇÃO:  Contém a lógica de negócio para as rotas de check-in.
//          Cada função é responsável por UMA operação no banco.
//
//  ROTAS IMPLEMENTADAS:
//    GET    /checkins          → lista todos os check-ins (index)
//    GET    /checkins/:id      → busca um check-in por ID (show)
//    POST   /checkins          → cria um novo check-in (create)
//    DELETE /checkins/:id      → remove um check-in (delete)
// ============================================================

const Checkin = require('../models/Checkin');

module.exports = {

  // ==========================================================
  // ROTA GET /checkins
  // Lista TODOS os check-ins salvos no banco, do mais recente
  // para o mais antigo.
  // ==========================================================
  async index(req, res) {
    try {
      // find() sem filtro retorna todos os documentos
      // sort({ dataRegistro: -1 }) ordena do mais recente ao mais antigo
      const checkins = await Checkin.find().sort({ dataRegistro: -1 });

      // Retorna a lista com status 200 (OK)
      return res.status(200).json(checkins);
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error);
      return res.status(500).json({ erro: 'Falha ao buscar os registros.' });
    }
  },

  // ==========================================================
  // ROTA GET /checkins/:id
  // Busca um check-in específico pelo seu ID do MongoDB.
  // Útil para exibir detalhes de um check-in individual.
  // ==========================================================
  async show(req, res) {
    try {
      const { id } = req.params;

      // findById busca exatamente um documento pelo _id do MongoDB
      const checkin = await Checkin.findById(id);

      // Se não encontrou, retorna 404 (Not Found)
      if (!checkin) {
        return res.status(404).json({ erro: 'Check-in não encontrado.' });
      }

      return res.status(200).json(checkin);
    } catch (error) {
      console.error('Erro ao buscar check-in por ID:', error);
      return res.status(500).json({ erro: 'Falha ao buscar o registro.' });
    }
  },

  // ==========================================================
  // ROTA POST /checkins
  // Cria um NOVO check-in no banco de dados.
  // Recebe os dados no corpo (body) da requisição.
  //
  // CAMPOS ESPERADOS NO BODY:
  //   localNome         (string, obrigatório)
  //   latitudeUsuario   (number, obrigatório)
  //   longitudeUsuario  (number, obrigatório)
  //   distrito          (string, opcional)
  //   area              (string, opcional)
  //   telefone          (string, opcional)
  //   avaliacao         (number 1-5, opcional)
  //   feedback          (string, opcional)
  // ==========================================================
  async create(req, res) {
    try {
      // 🐛 LOG TEMPORÁRIO DE DEBUG — remover depois de identificar o problema
      console.log('🐛 [DEBUG] req.body recebido:', JSON.stringify(req.body));
      console.log('🐛 [DEBUG] typeof avaliacao:', typeof req.body.avaliacao, '| valor:', req.body.avaliacao);

      // Desestrutura todos os campos esperados do corpo da requisição
      const {
        localNome,
        latitudeUsuario,
        longitudeUsuario,
        distrito,
        area,
        telefone,
        avaliacao,
        feedback,
      } = req.body;

      // --- Validação dos campos obrigatórios ---
      if (!localNome || latitudeUsuario == null || longitudeUsuario == null) {
        return res.status(400).json({
          erro: 'Os campos localNome, latitudeUsuario e longitudeUsuario são obrigatórios.',
        });
      }

      // --- Validação da avaliação (se fornecida, deve ser de 1 a 5) ---
      if (avaliacao !== undefined && (avaliacao < 1 || avaliacao > 5)) {
        return res.status(400).json({
          erro: 'A avaliação deve ser um número entre 1 e 5.',
        });
      }

      // --- Cria o novo documento no MongoDB ---
      const novoCheckin = await Checkin.create({
        localNome,
        latitudeUsuario,
        longitudeUsuario,
        distrito: distrito || 'Não informado',
        area: area || 'Não informado',
        telefone: telefone || 'Não informado',
        avaliacao: avaliacao || null,
        feedback: feedback || '',
      });

      // Retorna o documento criado com status 201 (Created)
      // 🐛 LOG TEMPORÁRIO DE DEBUG — remover depois de identificar o problema
      console.log('🐛 [DEBUG] Documento salvo no Mongo:', JSON.stringify(novoCheckin));
      return res.status(201).json(novoCheckin);

    } catch (error) {
      console.error('Erro ao criar check-in:', error);
      return res.status(500).json({ erro: 'Falha ao salvar o check-in.' });
    }
  },

  // ==========================================================
  // ROTA DELETE /checkins/:id
  // Remove um check-in específico do banco pelo seu ID.
  // ==========================================================
  async delete(req, res) {
    try {
      const { id } = req.params;

      // findByIdAndDelete encontra pelo ID e remove em uma única operação
      const checkinDeletado = await Checkin.findByIdAndDelete(id);

      // Se não encontrou o documento, retorna 404
      if (!checkinDeletado) {
        return res.status(404).json({ erro: 'Check-in não encontrado.' });
      }

      // Confirma a remoção com status 200
      return res.status(200).json({ mensagem: 'Check-in removido com sucesso!' });

    } catch (error) {
      console.error('Erro ao deletar check-in:', error);
      return res.status(500).json({ erro: 'Falha ao remover o check-in.' });
    }
  },
};
