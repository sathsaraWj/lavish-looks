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

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readJSON(CART_STORAGE_KEY, []))

  useEffect(() => {
    writeJSON(CART_STORAGE_KEY, lines)
  }, [lines])

  const addToCart = (productId: string) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === productId)
      if (existing) {
        return prev.map((line) =>
          line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  const setQuantity = (productId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.productId !== productId)
      return prev.map((line) => (line.productId === productId ? { ...line, quantity } : line))
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
