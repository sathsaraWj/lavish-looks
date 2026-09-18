import { useMemo, useState } from 'react'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'
import { formatLKR } from '../lib/format'
import { ProductCard } from '../components/ProductCard'
import { QrDemo } from '../components/QrDemo'
import { DemoNotice } from '../components/DemoNotice'
import { Link } from 'react-router-dom'

const categories = ['All', 'Hair Care', 'Skin Care', 'Bridal & Makeup'] as const

interface OrderRecord {
  orderNumber: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  placedAt: string
}

type Stage = 'shop' | 'checkout' | 'confirmation'

export function Products() {
  const { lines, addToCart, setQuantity, removeFromCart, subtotal, clearCart } = useCart()
  const [category, setCategory] = useState<(typeof categories)[number]>('All')
  const [stage, setStage] = useState<Stage>('shop')
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState<OrderRecord | null>(null)

  const visibleProducts = useMemo(
    () => (category === 'All' ? products : products.filter((p) => p.category === category)),
    [category],
  )

  const cartDetails = useMemo(
    () =>
      lines
        .map((line) => {
          const product = products.find((p) => p.id === line.productId)
          if (!product) return null
          return { product, quantity: line.quantity }
        })
        .filter((x): x is { product: (typeof products)[number]; quantity: number } => x !== null),
    [lines],
  )

  const handleSimulatePayment = () => {
    setProcessing(true)
    window.setTimeout(() => {
      const orderNumber = `LL-${Math.floor(100000 + Math.random() * 900000)}`
      setOrder({
        orderNumber,
        items: cartDetails.map(({ product, quantity }) => ({
          name: product.name,
          quantity,
          price: product.price,
        })),
        total: subtotal,
        placedAt: new Date().toLocaleString('en-LK', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      })
      clearCart()
      setProcessing(false)
      setStage('confirmation')
    }, 900)
  }

  if (stage === 'confirmation' && order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-3xl text-gold">
          ✓
        </div>
        <h1 className="mt-6 text-3xl">Order Confirmed</h1>
        <p className="mt-2 text-mauve">Thank you! Your demo order has been placed.</p>
        <div className="mt-8 rounded-2xl border border-gold-light/40 bg-cream p-6 text-left">
          <div className="flex items-center justify-between border-b border-gold-light/30 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-mauve">Order Number</p>
              <p className="font-serif text-lg font-semibold text-burgundy">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-mauve">Placed</p>
              <p className="text-sm">{order.placedAt}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <li key={item.name} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatLKR(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gold-light/30 pt-4 font-serif text-lg font-semibold text-burgundy">
            <span>Total Paid</span>
            <span>{formatLKR(order.total)}</span>
          </div>
        </div>
        <DemoNotice className="mt-6" />
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setOrder(null)
              setStage('shop')
            }}
            className="rounded-full bg-burgundy px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
          >
            Continue Shopping
          </button>
          <Link
            to="/"
            className="rounded-full border border-burgundy/30 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-burgundy transition hover:bg-burgundy/5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (stage === 'checkout') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
        <button
          type="button"
          onClick={() => setStage('shop')}
          className="text-sm font-semibold uppercase tracking-wide text-burgundy hover:underline"
        >
          ← Back to Cart
        </button>
        <h1 className="mt-4 text-3xl">Checkout</h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-lg">Order Summary</h2>
            <ul className="mt-4 space-y-3">
              {cartDetails.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between border-b border-black/5 pb-3 text-sm"
                >
                  <span>
                    {product.name} × {quantity}
                  </span>
                  <span className="font-semibold text-burgundy">
                    {formatLKR(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between font-serif text-xl font-semibold text-burgundy">
              <span>Total</span>
              <span>{formatLKR(subtotal)}</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg">Scan to Pay</h2>
            <p className="mt-1 text-sm text-mauve">
              Scan the Dialog Pay QR with your banking app to complete this demo order.
            </p>
            <div className="mt-4">
              <QrDemo
                amountLabel="Total due"
                amount={subtotal}
                reference={`ORDER-${lines.length}-${Math.round(subtotal)}`}
                onSimulatePayment={handleSimulatePayment}
                busy={processing}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Shop</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">Salon &amp; Beauty Products</h1>
        <p className="mx-auto mt-4 max-w-xl text-balance">
          Bring the salon home with the same premium products our stylists use.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3" role="tablist" aria-label="Filter products by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide transition ${
              category === cat
                ? 'bg-burgundy text-white'
                : 'bg-cream text-burgundy hover:bg-gold-light/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => {
            const line = lines.find((l) => l.productId === product.id)
            const quantity = line?.quantity ?? 0
            return (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={quantity}
                onAdd={() => addToCart(product.id)}
                onIncrease={() => setQuantity(product.id, quantity + 1)}
                onDecrease={() => setQuantity(product.id, quantity - 1)}
              />
            )
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-gold-light/30 bg-cream p-6 lg:sticky lg:top-24">
          <h2 className="text-lg">Your Cart</h2>
          {cartDetails.length === 0 ? (
            <p className="mt-4 text-sm text-mauve">Your cart is empty. Add products to begin.</p>
          ) : (
            <>
              <ul className="mt-4 space-y-4">
                {cartDetails.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-burgundy">{product.name}</p>
                      <p className="text-xs text-mauve">{formatLKR(product.price)} each</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${product.name}`}
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-burgundy/30 text-xs text-burgundy hover:bg-burgundy/10"
                        >
                          −
                        </button>
                        <span className="text-sm" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${product.name}`}
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-burgundy/30 text-xs text-burgundy hover:bg-burgundy/10"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="ml-2 text-xs font-semibold uppercase text-mauve underline hover:text-burgundy"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold text-burgundy">
                      {formatLKR(product.price * quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-between border-t border-gold-light/30 pt-4 font-serif text-lg font-semibold text-burgundy">
                <span>Total</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              <button
                type="button"
                onClick={() => setStage('checkout')}
                className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-light"
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
