export interface Service {
  id: string
  name: string
  category: 'Hair Styling & Colouring' | 'Skin Treatments' | 'Bridal Packages'
  description: string
  price: number
  depositPercent: number
  durationMins: number
}

export const services: Service[] = [
  {
    id: 'signature-cut',
    name: 'Signature Haircut & Style',
    category: 'Hair Styling & Colouring',
    description: 'Precision cut and blow-dry finish tailored to your face shape.',
    price: 3500,
    depositPercent: 0.3,
    durationMins: 60,
  },
  {
    id: 'full-colour',
    name: 'Full Hair Colour & Gloss',
    category: 'Hair Styling & Colouring',
    description: 'All-over colour with a glossing treatment for rich, vibrant tone.',
    price: 12000,
    depositPercent: 0.3,
    durationMins: 120,
  },
  {
    id: 'balayage',
    name: 'Balayage & Highlights',
    category: 'Hair Styling & Colouring',
    description: 'Hand-painted highlights for a sun-kissed, dimensional look.',
    price: 18000,
    depositPercent: 0.3,
    durationMins: 150,
  },
  {
    id: 'keratin-smoothing',
    name: 'Keratin Smoothing Treatment',
    category: 'Hair Styling & Colouring',
    description: 'Frizz-free, silky smooth hair that lasts up to 4 months.',
    price: 15000,
    depositPercent: 0.3,
    durationMins: 150,
  },
  {
    id: 'classic-facial',
    name: 'Classic Rejuvenating Facial',
    category: 'Skin Treatments',
    description: 'Deep cleanse, exfoliation and hydration for a refreshed glow.',
    price: 6000,
    depositPercent: 0.2,
    durationMins: 60,
  },
  {
    id: 'gold-facial',
    name: 'Gold Radiance Facial',
    category: 'Skin Treatments',
    description: '24k gold-infused facial that brightens and firms the skin.',
    price: 9500,
    depositPercent: 0.2,
    durationMins: 75,
  },
  {
    id: 'bridal-trial',
    name: 'Bridal Hair & Makeup Trial',
    category: 'Bridal Packages',
    description: 'A full trial run of your bridal look ahead of the big day.',
    price: 8000,
    depositPercent: 0.5,
    durationMins: 90,
  },
  {
    id: 'bridal-full',
    name: 'Full Bridal Package (Hair + Makeup)',
    category: 'Bridal Packages',
    description: 'Complete bridal hair styling and makeup for your wedding day.',
    price: 45000,
    depositPercent: 0.5,
    durationMins: 180,
  },
]

export const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
]
