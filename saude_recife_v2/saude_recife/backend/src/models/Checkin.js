// ============================================================
// ARQUIVO: src/models/Checkin.js
// FUNÇÃO:  Define o esquema (formato) dos dados de check-in
//          no MongoDB. Cada documento representa um check-in
//          feito pelo usuário em uma unidade de saúde, incluindo
//          a avaliação e o feedback textual.
// ============================================================

const mongoose = require('mongoose');

const CheckinSchema = new mongoose.Schema({

  // ----------------------------------------------------------
  // Dados da Unidade de Saúde (vindos da API do Dados Recife)
  // ----------------------------------------------------------

  // Nome da unidade de saúde (campo "unidade" na API do Recife)
  localNome: {
    type: String,
    required: [true, 'O nome do local é obrigatório.'],
    trim: true,
  },

  // Distrito sanitário ao qual a unidade pertence
  distrito: {
    type: String,
    default: 'Não informado',
  },

  // Bairro ou área de abrangência da unidade
  area: {
    type: String,
    default: 'Não informado',
  },

  // Telefone da unidade (útil para contato)
  telefone: {
    type: String,
    default: 'Não informado',
  },

  // ----------------------------------------------------------
  // Dados de Localização do Usuário (capturados pelo GPS)
  // ----------------------------------------------------------

  // Latitude da posição do usuário no momento do check-in
  latitudeUsuario: {
    type: Number,
    required: [true, 'A latitude do usuário é obrigatória.'],
  },

  // Longitude da posição do usuário no momento do check-in
  longitudeUsuario: {
    type: Number,
    required: [true, 'A longitude do usuário é obrigatória.'],
  },

  // ----------------------------------------------------------
  // Feedback e Avaliação do Usuário (nova funcionalidade v2)
  // ----------------------------------------------------------

  // Nota de 1 a 5 estrelas dada pelo usuário para a unidade
  avaliacao: {
    type: Number,
    min: [1, 'A avaliação mínima é 1 estrela.'],
    max: [5, 'A avaliação máxima é 5 estrelas.'],
    default: null,
  },

  // Comentário textual livre sobre a visita
  feedback: {
    type: String,
    maxlength: [500, 'O feedback não pode ter mais de 500 caracteres.'],
    default: '',
    trim: true,
  },

  // ----------------------------------------------------------
  // Controle de Data/Hora (preenchido automaticamente)
  // ----------------------------------------------------------

  // Data e hora em que o check-in foi registrado no banco
  dataRegistro: {
    type: Date,
    default: Date.now,
  },
});

// Exporta o modelo para ser usado nos Controllers
module.exports = mongoose.model('Checkin', CheckinSchema);
