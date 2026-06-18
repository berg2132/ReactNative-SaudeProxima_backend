// ============================================================
// ARQUIVO: src/config/db.js
// FUNÇÃO:  Gerencia a conexão com o banco de dados MongoDB.
//          Em desenvolvimento usa o MongoDB local.
//          Em produção usa a variável de ambiente MONGO_URI
//          (configurada no Render, Railway, etc.)
// ============================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Usa a variável de ambiente se existir (produção), senão usa o banco local
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saudeRecifeDB';

    await mongoose.connect(mongoURI);
    console.log('✅ Banco de Dados MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    // Encerra o processo se o banco não conectar — evita servidor rodando sem BD
    process.exit(1);
  }
};

module.exports = connectDB;
