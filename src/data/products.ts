export type ProductCategory = 'Hair Care' | 'Skin Care' | 'Bridal & Makeup' | 'Tools & Accessories'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description: string
  price: number
  image: string
  /** Units currently in stock. 0 means unavailable to order. */
  stock: number
}

export const productCategories: ProductCategory[] = [
  'Hair Care',
  'Skin Care',
  'Bridal & Makeup',
  'Tools & Accessories',
]

export const products: Product[] = [
  {
    id: 'argan-shampoo',
    name: 'Argan Silk Shampoo 250ml',
    category: 'Hair Care',
    description:
      'Sulphate-free cleansing shampoo infused with argan oil for smooth, glossy, salon-fresh hair.',
    price: 2450,
    image:
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
    stock: 42,
  },
  {
    id: 'keratin-mask',
    name: 'Keratin Repair Hair Mask 200g',
    category: 'Hair Care',
    description:
      'Deep-conditioning weekly treatment mask that rebuilds damaged strands and restores shine.',
    price: 3200,
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    stock: 18,
  },
  {
    id: 'heat-protectant',
    name: 'Rose Gold Heat Protectant Spray',
    category: 'Hair Care',
    description:
      'Lightweight leave-in spray that shields hair from heat styling up to 230°C, no greasy residue.',
    price: 1950,
    image:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
    stock: 6,
  },
  {
    id: 'radiance-serum',
    name: 'Radiance Glow Facial Serum 30ml',
    category: 'Skin Care',
    description:
      'Vitamin C and hyaluronic acid serum that brightens, hydrates and evens out skin tone.',
    price: 4500,
    image:
      'https://images.unsplash.com/photo-1523263685509-57c1d050d19b?auto=format&fit=crop&w=600&q=80',
    stock: 24,
  },
  {
    id: 'rose-mist',
    name: 'Hydrating Rose Face Mist 100ml',
    category: 'Skin Care',
    description: 'Refreshing rosewater mist that tones and hydrates skin throughout the day.',
    price: 1450,
    image:
      'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=600&q=80',
    stock: 30,
  },
  {
    id: 'cuticle-oil',
    name: 'Nourishing Cuticle & Hand Oil',
    category: 'Skin Care',
    description:
      'Fast-absorbing almond and jojoba oil blend that softens cuticles and hydrates hands.',
    price: 990,
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    stock: 0,
  },
  {
    id: 'velvet-lipstick',
    name: 'Velvet Matte Lipstick',
    category: 'Bridal & Makeup',
    description:
      'Long-wear, transfer-resistant matte lipstick in a soft rose shade — bridal favourite.',
    price: 1650,
    image:
      'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=600&q=80',
    stock: 15,
  },
  {
    id: 'bridal-sponge-set',
    name: 'Luxury Blending Sponge Set',
    category: 'Bridal & Makeup',
    description:
      'Set of 3 premium blending sponges for a flawless, airbrushed bridal makeup finish.',
    price: 1250,
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80',
    stock: 4,
  },
  {
    id: 'rose-perfume',
    name: 'Signature Rose Perfume Mist 50ml',
    category: 'Bridal & Makeup',
    description: 'A delicate, long-lasting rose and jasmine fragrance — a bridal-day favourite.',
    price: 3800,
    image:
      'https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=600&q=80',
    stock: 12,
  },
  {
    id: 'detangling-comb',
    name: 'Wide-Tooth Detangling Comb',
    category: 'Tools & Accessories',
    description: 'Gentle, snag-free detangling comb suited to all hair types, including extensions.',
    price: 850,
    image:
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80',
    stock: 60,
  },
]
