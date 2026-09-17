export const CATEGORIES = [
  { value: 'roupas', label: 'Roupas' },
  { value: 'sapatos', label: 'Sapatos' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'bolsas', label: 'Bolsas' },
  { value: 'outros', label: 'Outros' }
]

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || 'Outros'
}

export const CLOTHING_SIZES = ['P', 'M', 'G', 'GG', 'XG']

export const SHOE_SIZES = ['33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44']

export const CONDITIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'semi-novo', label: 'Semi-novo' },
  { value: 'usado', label: 'Usado' }
]

export function conditionLabel(value) {
  return CONDITIONS.find((c) => c.value === value)?.label || 'Semi-novo'
}

export const STATUS = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'vendido', label: 'Vendido' }
]

export function statusLabel(value) {
  return STATUS.find((s) => s.value === value)?.label || 'Disponível'
}