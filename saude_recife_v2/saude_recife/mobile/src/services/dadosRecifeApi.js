// ============================================================
// ARQUIVO: src/services/dadosRecifeApi.js
// FUNÇÃO:  Centraliza todas as chamadas para a API pública do
//          Portal de Dados Abertos da Prefeitura do Recife.
//
//  API ESCOLHIDA:
//    Dataset: "Unidades de Saúde do Recife"
//    Resource ID: c727e8f8-40e9-415e-b14d-2c46406abb60
//
//  JUSTIFICATIVA DA ESCOLHA:
//    Este recurso foi escolhido por ser o mais completo para
//    o objetivo do app: retorna nome, distrito, telefone e
//    área de abrangência de todas as unidades de saúde do
//    município do Recife (UBS, NASF, policlínicas, etc).
//    É o mesmo endpoint já utilizado no projeto original,
//    porém agora com filtro por proximidade e mais dados exibidos.
//
//  ENDPOINT BASE:
//    https://dados.recife.pe.gov.br/api/3/action/datastore_search
//
//  DOCUMENTAÇÃO:
//    https://dados.recife.pe.gov.br/dataset/unidades-de-saude
// ============================================================

import axios from 'axios';

// URL base da API CKAN do Portal de Dados Abertos do Recife
const BASE_URL = 'https://dados.recife.pe.gov.br/api/3/action/datastore_search';

// ID do recurso de Unidades de Saúde do Recife
const RESOURCE_ID = 'c727e8f8-40e9-415e-b14d-2c46406abb60';

// ============================================================
// Função: buscarTodasUnidades
// Busca todas as unidades de saúde cadastradas na API do Recife.
// Retorna até 100 registros (limite da API gratuita por chamada).
// ============================================================
export const buscarTodasUnidades = async () => {
  try {
    const resposta = await axios.get(BASE_URL, {
      params: {
        resource_id: RESOURCE_ID,
        limit: 100, // máximo de registros por requisição
      },
      timeout: 10000, // timeout de 10 segundos para não travar o app
    });

    // A API do CKAN retorna os registros dentro de result.records
    return resposta.data.result.records;
  } catch (error) {
    console.error('Erro ao buscar unidades de saúde:', error.message);
    throw new Error('Não foi possível carregar as unidades de saúde. Verifique sua conexão.');
  }
};

// ============================================================
// Função: calcularDistancia
// Calcula a distância em KM entre dois pontos geográficos
// usando a fórmula de Haversine (precisão suficiente para cidades).
//
// Parâmetros:
//   lat1, lon1 — coordenadas do usuário
//   lat2, lon2 — coordenadas da unidade de saúde
// ============================================================
export const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  // Raio médio da Terra em quilômetros
  const RAIO_TERRA_KM = 6371;

  // Converte os deltas de latitude e longitude para radianos
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  // Fórmula de Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Retorna a distância em quilômetros
  return RAIO_TERRA_KM * c;
};

// ============================================================
// Função: filtrarPorProximidade
// Filtra e ordena as unidades de saúde por distância do usuário.
// Retorna apenas as unidades com latitude/longitude válidas,
// dentro do raio informado, ordenadas da mais próxima.
//
// Parâmetros:
//   unidades     — array de registros da API
//   latUsuario   — latitude atual do usuário
//   lonUsuario   — longitude atual do usuário
//   raioKm       — raio máximo em km (padrão: 10 km)
// ============================================================
export const filtrarPorProximidade = (unidades, latUsuario, lonUsuario, raioKm = 10) => {
  return unidades
    // 1. Filtra apenas unidades que possuem coordenadas válidas
    .filter((u) => {
      const lat = parseFloat(u.latitude);
      const lon = parseFloat(u.longitude);
      return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
    })
    // 2. Adiciona a distância calculada em cada objeto
    .map((u) => ({
      ...u,
      distanciaKm: calcularDistancia(
        latUsuario,
        lonUsuario,
        parseFloat(u.latitude),
        parseFloat(u.longitude)
      ),
    }))
    // 3. Mantém apenas as que estão dentro do raio definido
    .filter((u) => u.distanciaKm <= raioKm)
    // 4. Ordena da mais próxima para a mais distante
    .sort((a, b) => a.distanciaKm - b.distanciaKm);
};
