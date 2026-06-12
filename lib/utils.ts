// Formatar telefone (xx) xxxxx-xxxx (celular) ou (xx) xxxx-xxxx (fixo)
export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  if (!cleaned) return '';
  if (cleaned.length <= 2) return `(${cleaned}`;

  const area = cleaned.slice(0, 2);
  const number = cleaned.slice(2);
  const prefixLength = number.length > 8 ? 5 : 4;
  if (number.length <= prefixLength) return `(${area}) ${number}`;
  return `(${area}) ${number.slice(0, prefixLength)}-${number.slice(prefixLength)}`;
}

// Remover formatação de telefone
export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

// Lista de estados brasileiros
export const ESTADOS_BR = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

// Interface para cidade do IBGE
export interface CidadeIBGE {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

// Cache para evitar requisições repetidas
const CIDADES_CACHE: { [key: string]: string[] } = {};

// Obter cidades por estado usando API do IBGE
export async function getCidadesByEstadoIBGE(estado: string): Promise<string[]> {
  if (!estado) return [];
  
  // Verifica cache
  if (CIDADES_CACHE[estado]) {
    return CIDADES_CACHE[estado];
  }

  try {
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar cidades');
    }

    const data: CidadeIBGE[] = await response.json();
    
    // Extrair apenas os nomes das cidades e ordenar alfabeticamente
    const cidades = data.map((cidade) => cidade.nome).sort((a, b) => a.localeCompare(b));
    
    // Salvar no cache
    CIDADES_CACHE[estado] = cidades;
    
    return cidades;
  } catch (error) {
    console.error('Erro ao carregar cidades do IBGE:', error);
    return [];
  }
}

// Função legacy para compatibilidade (ainda usada em alguns lugares
export function getCidadesByEstado(estado: string): string[] {
  return CIDADES_CACHE[estado] || [];
}
