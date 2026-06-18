// ============================================================
// ARQUIVO: src/models/Usuario.js
// FUNÇÃO:  Define o esquema dos usuários do aplicativo.
//          Armazena nome de usuário e senha (em produção real,
//          a senha deveria ser criptografada com bcrypt).
// ============================================================

const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({

  // Nome de exibição do usuário
  nome: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
    trim: true,
  },

  // E-mail usado como identificador único de login
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório.'],
    unique: true,
    lowercase: true,
    trim: true,
  },

  // Senha do usuário (em produção: usar bcrypt para hash)
  senha: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
    minlength: [6, 'A senha deve ter no mínimo 6 caracteres.'],
  },

  // Data de cadastro, preenchida automaticamente
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
