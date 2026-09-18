import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { products } from '../data/products'
import { readJSON, writeJSON } from '../lib/storage'

interface CartLine {
  productId: string
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  addToCart: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CART_STORAGE_KEY = 'lavish-looks-cart'

const CartContext = createContext<CartContextValue | null>(null)

function sanitizeLines(lines: CartLine[]): CartLine[] {
  return lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId)
      if (!product) return null
      const quantity = Math.min(line.quantity, product.stock)
      return quantity > 0 ? { productId: line.productId, quantity } : null
    })
    .filter((line): line is CartLine => line !== null)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() =>
    sanitizeLines(readJSON(CART_STORAGE_KEY, [])),
  )

  useEffect(() => {
    writeJSON(CART_STORAGE_KEY, lines)
  }, [lines])

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product || product.stock <= 0) return
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === productId)
      const currentQuantity = existing?.quantity ?? 0
      if (currentQuantity >= product.stock) return prev
      if (existing) {
        return prev.map((line) =>
          line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  const setQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId)
    const max = product ? product.stock : 0
    const clamped = Math.min(Math.max(quantity, 0), max)
    setLines((prev) => {
      if (clamped <= 0) return prev.filter((line) => line.productId !== productId)
      const existing = prev.find((line) => line.productId === productId)
      if (!existing) return [...prev, { productId, quantity: clamped }]
      return prev.map((line) => (line.productId === productId ? { ...line, quantity: clamped } : line))
    })
  }

  const removeFromCart = (productId: string) => {
    setLines((prev) => prev.filter((line) => line.productId !== productId))
  }

  const clearCart = () => setLines([])

  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines])

  const subtotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = products.find((p) => p.id === line.productId)
      return product ? sum + product.price * line.quantity : sum
    }, 0)
  }, [lines])

  const value: CartContextValue = {
    lines,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    subtotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
