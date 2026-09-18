import type { Product } from '../data/products'
import { formatLKR } from '../lib/format'

interface ProductCardProps {
  product: Product
  quantityInCart: number
  onAdd: () => void
  onIncrease: () => void
  onDecrease: () => void
}

export function ProductCard({
  product,
  quantityInCart,
  onAdd,
  onIncrease,
  onDecrease,
}: ProductCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="aspect-square overflow-hidden bg-cream">
        <img src={product.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">
          {product.category}
        </p>
        <h3 className="mt-1 text-lg">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed">{product.description}</p>
        <p className="mt-4 font-serif text-xl font-semibold text-burgundy">
          {formatLKR(product.price)}
        </p>

        {quantityInCart === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 w-full rounded-full bg-burgundy px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
          >
            Add to Cart
          </button>
        ) : (
          <div
            className="mt-4 flex items-center justify-between rounded-full border border-burgundy/20 px-2 py-1"
            role="group"
            aria-label={`Quantity for ${product.name}`}
          >
            <button
              type="button"
              onClick={onDecrease}
              aria-label={`Decrease quantity of ${product.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-burgundy transition hover:bg-burgundy/10"
            >
              −
            </button>
            <span className="text-sm font-semibold text-burgundy" aria-live="polite">
              {quantityInCart} in cart
            </span>
            <button
              type="button"
              onClick={onIncrease}
              aria-label={`Increase quantity of ${product.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-burgundy transition hover:bg-burgundy/10"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
