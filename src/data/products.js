// Produtos de exemplo usados como fallback quando a API não está disponível.
// Os produtos reais ficam em server/data/products.json e são gerenciados
// pelo painel admin (#/admin). Imagens estáticas ficam em public/images/.

const products = [
  {
    id: 'produto-1',
    name: 'Jaqueta Vintage',
    category: 'roupas',
    size: 'M',
    shoeSize: '',
    condition: 'semi-novo',
    brand: '',
    color: 'Preto',
    price: 89.9,
    salePrice: null,
    description: 'Peça selecionada • Tamanho M',
    images: ['/images/produto1.svg'],
    status: 'disponivel'
  },
  {
    id: 'produto-2',
    name: 'Camisa Social Slim',
    category: 'roupas',
    size: 'G',
    shoeSize: '',
    condition: 'semi-novo',
    brand: '',
    color: 'Branco',
    price: 49.9,
    salePrice: null,
    description: 'Peça selecionada • Tamanho G',
    images: ['/images/produto2.svg'],
    status: 'disponivel'
  },
  {
    id: 'produto-3',
    name: 'Vestido Midi Elegante',
    category: 'roupas',
    size: 'P',
    shoeSize: '',
    condition: 'novo',
    brand: '',
    color: 'Roxo',
    price: 79.9,
    salePrice: null,
    description: 'Peça selecionada • Tamanho P',
    images: ['/images/produto3.svg'],
    status: 'disponivel'
  },
  {
    id: 'produto-4',
    name: 'Blazer Alfaiataria',
    category: 'roupas',
    size: 'M',
    shoeSize: '',
    condition: 'semi-novo',
    brand: '',
    color: 'Preto',
    price: 119.9,
    salePrice: 99.9,
    description: 'Peça selecionada • Tamanho M',
    images: ['/images/produto4.svg'],
    status: 'disponivel'
  }
]

export default products