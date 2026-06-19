// ============================================================
// ARQUIVO: src/services/dadosRecifeApi.js
// FUNÇÃO:  Centraliza todas as chamadas para a API pública do
//          Portal de Dados Abertos da Prefeitura do Recife.
//
//  API ESCOLHIDA (unidades):
//    Dataset: "Unidades de Saúde do Recife"
//    Resource ID: c727e8f8-40e9-415e-b14d-2c46406abb60
//
//  JUSTIFICATIVA DA ESCOLHA:
//    Este recurso foi escolhido por ser o mais completo para
//    o objetivo do app: retorna nome, distrito, telefone e
//    área de abrangência de todas as unidades de saúde do
//    município do Recife (UBS, NASF, policlínicas, etc).
//    É o mesmo endpoint já utilizado no projeto original.
//
//  ⚠️ IMPORTANTE — POR QUE AGRUPAMOS OS REGISTROS:
//    Esse dataset traz UMA LINHA POR EQUIPE de saúde da família,
//    não uma linha por unidade física. Por isso a mesma unidade
//    (ex: "US 221 - PSF ILHA DE JOANEIRO") aparece várias vezes,
//    uma para cada equipe (EQUIPE I, EQUIPE II, ...). A função
//    `agruparUnidadesDuplicadas` (abaixo) resolve isso reunindo
//    todas as equipes de uma mesma unidade em um único card.
//
//  API ESCOLHIDA (serviços oferecidos):
//    Dataset: "Rede de Atenção à Saúde no Recife"
//    Dataset slug: rede-de-atencao-a-saude-no-recife
//
//    Esse dataset traz os tipos de serviço prestados por cada
//    unidade (ex: odontologia, raio-x, etc), também via API
//    CKAN (datastore_search), no mesmo padrão do dataset de
//    unidades. Como o ID do resource pode ser republicado pela
//    Prefeitura de tempos em tempos, ele é configurável abaixo
//    em RESOURCE_ID_SERVICOS — confira o ID atual em:
//    http://dados.recife.pe.gov.br/dataset/rede-de-atencao-a-saude-no-recife
//    (clique no recurso CSV/JSON → "API de dados" → copie o
//    resource_id da URL mostrada).
//
//    Caso esse ID fique desatualizado ou o serviço esteja fora
//    do ar, o app NÃO quebra: simplesmente os cards aparecem
//    sem a lista de serviços (ver tratamento de erro abaixo).
//
//  ENDPOINT BASE (CKAN — comum aos dois datasets):
//    https://dados.recife.pe.gov.br/api/3/action/datastore_search
//
//  DOCUMENTAÇÃO:
//    https://dados.recife.pe.gov.br/dataset/unidades-de-saude
//    https://dados.recife.pe.gov.br/dataset/rede-de-atencao-a-saude-no-recife
// ============================================================

import axios from 'axios';

// URL base da API CKAN do Portal de Dados Abertos do Recife
const BASE_URL = 'https://dados.recife.pe.gov.br/api/3/action/datastore_search';

// ID do recurso de Unidades de Saúde do Recife (nomes, distrito, telefone, área/equipe)
const RESOURCE_ID_UNIDADES = 'c727e8f8-40e9-415e-b14d-2c46406abb60';

// ID do recurso de Serviços da Rede de Atenção à Saúde (odontologia, raio-x, etc).
// ⚠️ CONFIRME este ID periodicamente — ver instruções no cabeçalho do arquivo.
const RESOURCE_ID_SERVICOS = 'd05f6ffa-304b-4a28-bd03-1ffb26cbf866';

// ============================================================
// Função utilitária: normalizarTexto
// Remove acentos, espaços duplicados e padroniza para minúsculo.
// Usada para comparar nomes de unidades vindos de datasets
// diferentes (que podem ter grafias levemente diferentes).
// ============================================================
const normalizarTexto = (texto = '') =>
  texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

// ============================================================
// Função: buscarTodasUnidades
// Busca todas as unidades de saúde cadastradas na API do Recife.
// Retorna até 100 registros (limite usado por requisição) —
// ainda SEM agrupar (uma linha por equipe).
// ============================================================
export const buscarTodasUnidades = async () => {
  try {
    const resposta = await axios.get(BASE_URL, {
      params: {
        resource_id: RESOURCE_ID_UNIDADES,
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
// Função: buscarServicosPorUnidade
// Busca o dataset de "Rede de Atenção à Saúde" e devolve um
// MAPA (objeto) onde a chave é o nome normalizado da unidade e
// o valor é um array de serviços oferecidos (ex: ["ODONTOLOGIA",
// "RAIO-X", "VACINAÇÃO"]).
//
// Se a chamada falhar (endpoint fora do ar, resource_id mudou,
// etc), retorna um mapa VAZIO em vez de lançar erro — assim a
// tela principal continua funcionando, só sem mostrar serviços.
// ============================================================
export const buscarServicosPorUnidade = async () => {
  try {
    const resposta = await axios.get(BASE_URL, {
      params: {
        resource_id: RESOURCE_ID_SERVICOS,
        limit: 1000,
      },
      timeout: 10000,
    });

    const registros = resposta.data.result.records || [];
    const mapaServicos = {};

    registros.forEach((registro) => {
      // Nomes de campo podem variar entre datasets do portal;
      // tentamos os mais comuns para nome da unidade e serviço.
      const nomeUnidade =
        registro.unidade || registro.nome_unidade || registro.estabelecimento || '';
      const servico =
        registro.servico || registro.tipo_servico || registro.especialidade || '';

      if (!nomeUnidade || !servico) return;

      const chave = normalizarTexto(nomeUnidade);
      if (!mapaServicos[chave]) {
        mapaServicos[chave] = new Set();
      }
      mapaServicos[chave].add(servico.toString().trim());
    });

    // Converte os Sets em arrays simples para facilitar o uso na UI
    const mapaFinal = {};
    Object.keys(mapaServicos).forEach((chave) => {
      mapaFinal[chave] = Array.from(mapaServicos[chave]);
    });

    return mapaFinal;
  } catch (error) {
    // Não interrompe o fluxo do app — apenas loga e segue sem dados de serviço.
    console.warn(
      'Não foi possível carregar os serviços por unidade (seguindo sem essa informação):',
      error.message
    );
    return {};
  }
};

// ============================================================
// Função: agruparUnidadesDuplicadas
// Resolve o problema de duplicação: o dataset de unidades traz
// uma linha por EQUIPE (ex: "EQUIPE I", "EQUIPE II") da mesma
// unidade física. Esta função agrupa os registros por unidade
// (nome + distrito, que juntos identificam a unidade física) e:
//   - mantém um único card por unidade
//   - junta as áreas/equipes em uma lista (ex: "EQUIPE I, EQUIPE II")
//   - anexa a lista de serviços (vinda de `mapaServicos`), se houver
// ============================================================
export const agruparUnidadesDuplicadas = (unidades, mapaServicos = {}) => {
  const grupos = new Map();

  unidades.forEach((unidade) => {
    const nome = unidade.unidade || 'Unidade sem nome';
    // Chave de agrupamento: nome + distrito normalizado.
    // (duas unidades diferentes podem ter nomes parecidos em
    // distritos diferentes, então o distrito ajuda a não juntar
    // unidades que são, na realidade, distintas)
    const chave = `${normalizarTexto(nome)}|${normalizarTexto(unidade.distrito)}`;

    if (!grupos.has(chave)) {
      grupos.set(chave, {
        ...unidade,
        areas: new Set(),
        servicos: [],
      });
    }

    const grupo = grupos.get(chave);
    if (unidade.area) {
      grupo.areas.add(unidade.area.toString().trim());
    }
  });

  // Converte os grupos de volta em um array de unidades únicas
  return Array.from(grupos.values()).map((grupo) => {
    const chaveServico = normalizarTexto(grupo.unidade);
    return {
      ...grupo,
      // Lista de equipes/áreas que atendem nesta unidade, já sem duplicar
      area: Array.from(grupo.areas).join(', '),
      // Lista de serviços oferecidos (vazia se não encontramos no dataset de serviços)
      servicos: mapaServicos[chaveServico] || [],
    };
  });
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
//   unidades     — array de registros da API (já agrupados)
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
