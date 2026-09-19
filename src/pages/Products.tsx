import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { productCategories, products, type Product } from '../data/products'
import { districts, getDeliveryFee } from '../data/delivery'
import { useCart } from '../context/CartContext'
import { formatLKR } from '../lib/format'
import {
  EMAIL_PATTERN,
  POSTAL_CODE_PATTERN,
  generateReference,
  normalizeSriLankanMobile,
} from '../lib/validation'
import { MOBILE_ERROR } from '../lib/otp'
import { useStageFocus } from '../lib/useStageFocus'
import { ProductCard } from '../components/ProductCard'
import { DialogPayQr } from '../components/DialogPayQr'
import { MobileVerification } from '../components/MobileVerification'
import { PaymentProcessingModal } from '../components/PaymentProcessingModal'
import { PrototypeDisclosure } from '../components/PrototypeDisclosure'

const categoryTabs = ['All', ...productCategories] as const
type PaymentMethod = 'qr' | 'cod'
type Stage = 'shop' | 'checkout' | 'verify' | 'payment' | 'preview'

interface CustomerDetails {
  fullName: string
  phone: string
  email: string
  street: string
  city: string
  district: string
  postalCode: string
}

interface FormErrors {
  fullName?: string
  phone?: string
  email?: string
  street?: string
  city?: string
  district?: string
  postalCode?: string
  paymentMethod?: string
}

interface OrderSummary {
  reference: string
  items: { name: string; quantity: number; price: number }[]
  subtotal: number
  deliveryFee: number
  total: number
  customer: CustomerDetails
  paymentMethod: PaymentMethod
}

const emptyCustomer: CustomerDetails = {
  fullName: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  district: '',
  postalCode: '',
}

export function Products() {
  const { lines, addToCart, setQuantity, removeFromCart, subtotal, clearCart } = useCart()
  const [category, setCategory] = useState<(typeof categoryTabs)[number]>('All')
  const [search, setSearch] = useState('')

  const [stage, setStage] = useState<Stage>('shop')
  const [customer, setCustomer] = useState<CustomerDetails>(emptyCustomer)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [dialogPhone, setDialogPhone] = useState('')
  const [reference, setReference] = useState('')
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const headingRef = useStageFocus(stage)

  const visibleProducts = useMemo(() => {
    const byCategory = category === 'All' ? products : products.filter((p) => p.category === category)
    const query = search.trim().toLowerCase()
    if (!query) return byCategory
    return byCategory.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
    )
  }, [category, search])

  const cartDetails = useMemo(
    () =>
      lines
        .map((line) => {
          const product = products.find((p) => p.id === line.productId)
          if (!product) return null
          return { product, quantity: line.quantity }
        })
        .filter((x): x is { product: Product; quantity: number } => x !== null),
    [lines],
  )

  const deliveryFee = customer.district ? getDeliveryFee(customer.district) : 0
  const total = subtotal + deliveryFee

  const updateCustomer = (field: keyof CustomerDetails, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!customer.fullName.trim() || customer.fullName.trim().length < 2)
      next.fullName = 'Please enter your full name.'
    if (!normalizeSriLankanMobile(customer.phone)) next.phone = MOBILE_ERROR
    if (!EMAIL_PATTERN.test(customer.email.trim())) next.email = 'Enter a valid email address.'
    if (!customer.street.trim()) next.street = 'Please enter your street address.'
    if (!customer.city.trim()) next.city = 'Please enter your city.'
    if (!customer.district) next.district = 'Please select your district.'
    if (!POSTAL_CODE_PATTERN.test(customer.postalCode.trim()))
      next.postalCode = 'Enter a valid 5-digit postal code.'
    if (!paymentMethod) next.paymentMethod = 'Please choose a payment method.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const buildOrder = (method: PaymentMethod, ref: string): OrderSummary => ({
    reference: ref,
    items: cartDetails.map(({ product, quantity }) => ({
      name: product.name,
      quantity,
      price: product.price,
    })),
    subtotal,
    deliveryFee,
    total,
    customer,
    paymentMethod: method,
  })

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !paymentMethod) return
    const ref = generateReference('ORD')
    setReference(ref)
    if (paymentMethod === 'cod') {
      // Cash on Delivery skips mobile verification and the QR payment entirely.
      setOrder(buildOrder('cod', ref))
      setStage('preview')
    } else {
      // Pre-fill the delivery phone as a convenience; the customer can change it before requesting a code.
      setDialogPhone((prev) => prev || customer.phone.trim())
      setStage('verify')
    }
  }

  const handlePaymentPreviewDone = () => {
    setPaymentModalOpen(false)
    setOrder(buildOrder('qr', reference))
    setStage('preview')
  }

  const startNewOrder = () => {
    clearCart()
    setCustomer(emptyCustomer)
    setPaymentMethod('')
    setErrors({})
    setDialogPhone('')
    setReference('')
    setOrder(null)
    setStage('shop')
  }

  // ---------- Preview ----------
  if (stage === 'preview' && order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <div className="flex items-center justify-between">
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl outline-none">Order Preview</h1>
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-burgundy">
            Ref: {order.reference}
          </span>
        </div>
        <p className="mt-2 text-mauve">Please review your order details below.</p>

        <div className="mt-8 space-y-6 rounded-2xl border border-gold-light/40 bg-cream p-6 text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mauve">Deliver To</p>
            <p className="mt-1 text-sm font-semibold text-burgundy">{order.customer.fullName}</p>
            <p className="text-sm">{order.customer.phone}</p>
            <p className="text-sm">{order.customer.email}</p>
            <p className="mt-1 text-sm">
              {order.customer.street}, {order.customer.city}
              <br />
              {order.customer.district} {order.customer.postalCode}
            </p>
          </div>

          <ul className="space-y-2 border-t border-gold-light/30 pt-4">
            {order.items.map((item) => (
              <li key={item.name} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatLKR(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-gold-light/30 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatLKR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee ({order.customer.district})</span>
              <span>{formatLKR(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-gold-light/30 pt-2 font-serif text-lg font-semibold text-burgundy">
              <span>{order.paymentMethod === 'cod' ? 'Amount due on delivery' : 'Total'}</span>
              <span>{formatLKR(order.total)}</span>
            </div>
          </div>

          <div className="border-t border-gold-light/30 pt-4 text-sm">
            <span className="text-mauve">Payment Method: </span>
            <span className="font-semibold text-burgundy">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Dialog Pay QR'}
            </span>
          </div>
        </div>

        <PrototypeDisclosure subject="order" className="mt-6" />

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={startNewOrder}
            className="rounded-full bg-burgundy px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
          >
            Start a New Order
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

  // ---------- Mobile verification + QR payment ----------
  if (stage === 'verify' || stage === 'payment') {
    const onVerifyStep = stage === 'verify'
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <button
          type="button"
          onClick={() => setStage('checkout')}
          className="text-sm font-semibold uppercase tracking-wide text-burgundy hover:underline"
        >
          ← Back to Details
        </button>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          {onVerifyStep ? 'Step 1 of 2 · Verify your number' : 'Step 2 of 2 · Scan and pay'}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl outline-none">
          Pay with Dialog Pay QR
        </h1>
        <p className="mt-2 text-sm text-mauve">
          Order reference <span className="font-semibold text-burgundy">{reference}</span> · Delivering
          to {customer.district} · Total {formatLKR(total)}
        </p>
        <div className="mt-8">
          {onVerifyStep ? (
            <MobileVerification
              phone={dialogPhone}
              onPhoneChange={setDialogPhone}
              onVerified={() => setStage('payment')}
            />
          ) : (
            <DialogPayQr
              amountLabel="Total due"
              amount={total}
              reference={reference}
              onScanned={() => setPaymentModalOpen(true)}
              disabled={paymentModalOpen}
            />
          )}
        </div>
        <PaymentProcessingModal
          open={paymentModalOpen}
          amount={total}
          summaryLabel="View order summary"
          onDone={handlePaymentPreviewDone}
        />
      </div>
    )
  }

  // ---------- Checkout ----------
  if (stage === 'checkout') {
    if (cartDetails.length === 0) {
      return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-8">
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl outline-none">Your Cart is Empty</h1>
          <p className="mt-3 text-mauve">Add some products before proceeding to checkout.</p>
          <button
            type="button"
            onClick={() => setStage('shop')}
            className="mt-8 rounded-full bg-burgundy px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
          >
            Back to Shop
          </button>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
        <button
          type="button"
          onClick={() => setStage('shop')}
          className="text-sm font-semibold uppercase tracking-wide text-burgundy hover:underline"
        >
          ← Back to Cart
        </button>
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl outline-none">Checkout</h1>

        <form className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmitCheckout} noValidate>
          <div className="space-y-10">
            <section>
              <h2 className="text-lg">Delivery Details</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-burgundy">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={customer.fullName}
                    onChange={(e) => updateCustomer('fullName', e.target.value)}
                    placeholder="e.g. Amaya Perera"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="mt-1 text-xs text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-burgundy">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => updateCustomer('phone', e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
                  />
                  {errors.phone && (
                    <p id="phone-error" className="mt-1 text-xs text-red-600">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-burgundy">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => updateCustomer('email', e.target.value)}
                    placeholder="e.g. amaya@email.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="street" className="block text-sm font-semibold text-burgundy">
                    Street Address
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={customer.street}
                    onChange={(e) => updateCustomer('street', e.target.value)}
                    placeholder="e.g. 45/2 Lake Road"
                    aria-invalid={Boolean(errors.street)}
                    aria-describedby={errors.street ? 'street-error' : undefined}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
                  />
                  {errors.street && (
                    <p id="street-error" className="mt-1 text-xs text-red-600">
                      {errors.street}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-burgundy">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={customer.city}
                    onChange={(e) => updateCustomer('city', e.target.value)}
                    placeholder="e.g. Meegoda"
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
                  />
                  {errors.city && (
                    <p id="city-error" className="mt-1 text-xs text-red-600">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-semibold text-burgundy">
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    inputMode="numeric"
                    value={customer.postalCode}
                    onChange={(e) => updateCustomer('postalCode', e.target.value)}
                    placeholder="e.g. 10500"
                    aria-invalid={Boolean(errors.postalCode)}
                    aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
                  />
                  {errors.postalCode && (
                    <p id="postalCode-error" className="mt-1 text-xs text-red-600">
                      {errors.postalCode}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="district" className="block text-sm font-semibold text-burgundy">
                    District
                  </label>
                  <select
                    id="district"
                    value={customer.district}
                    onChange={(e) => updateCustomer('district', e.target.value)}
                    aria-invalid={Boolean(errors.district)}
                    aria-describedby={errors.district ? 'district-error' : undefined}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
                  >
                    <option value="">Select your district…</option>
                    {districts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} — Delivery {formatLKR(d.fee)}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p id="district-error" className="mt-1 text-xs text-red-600">
                      {errors.district}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg">Payment Method</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
                <label
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    paymentMethod === 'qr'
                      ? 'border-burgundy bg-burgundy/5'
                      : 'border-black/10 hover:border-burgundy/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={() => {
                        setPaymentMethod('qr')
                        setErrors((prev) => ({ ...prev, paymentMethod: undefined }))
                      }}
                      className="h-4 w-4 accent-burgundy"
                    />
                    <span className="font-semibold text-burgundy">Dialog Pay QR</span>
                  </div>
                  <p className="mt-2 text-xs text-mauve">
                    Pay instantly by scanning a QR code with your banking app.
                  </p>
                </label>

                <label
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    paymentMethod === 'cod'
                      ? 'border-burgundy bg-burgundy/5'
                      : 'border-black/10 hover:border-burgundy/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => {
                        setPaymentMethod('cod')
                        setErrors((prev) => ({ ...prev, paymentMethod: undefined }))
                      }}
                      className="h-4 w-4 accent-burgundy"
                    />
                    <span className="font-semibold text-burgundy">Cash on Delivery</span>
                  </div>
                  <p className="mt-2 text-xs text-mauve">
                    Pay in cash when your order arrives, including the delivery fee.
                  </p>
                </label>
              </div>
              {errors.paymentMethod && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {errors.paymentMethod}
                </p>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-gold-light/30 bg-cream p-6 lg:sticky lg:top-24">
            <h2 className="text-lg">Order Summary</h2>
            <ul className="mt-4 space-y-2">
              {cartDetails.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between text-sm">
                  <span>
                    {product.name} × {quantity}
                  </span>
                  <span className="whitespace-nowrap font-semibold text-burgundy">
                    {formatLKR(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-gold-light/30 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {customer.district ? formatLKR(deliveryFee) : 'Select a district'}
                </span>
              </div>
              <div className="flex justify-between border-t border-gold-light/30 pt-2 font-serif text-lg font-semibold text-burgundy">
                <span>Total</span>
                <span>{formatLKR(total)}</span>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-light"
            >
              Continue
            </button>
          </aside>
        </form>
      </div>
    )
  }

  // ---------- Shop ----------
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Shop</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl outline-none sm:text-4xl">Salon &amp; Beauty Products</h1>
        <p className="mx-auto mt-4 max-w-xl text-balance">
          Bring the salon home with the same premium products our stylists use.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-md">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm focus:border-burgundy focus:outline-none"
        />
      </div>

      <div
        className="mt-6 flex flex-wrap justify-center gap-3"
        role="tablist"
        aria-label="Filter products by category"
      >
        {categoryTabs.map((cat) => (
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
        {visibleProducts.length === 0 ? (
          <p className="text-center text-mauve">No products match your search.</p>
        ) : (
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
        )}

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
                          disabled={quantity >= product.stock}
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-burgundy/30 text-xs text-burgundy hover:bg-burgundy/10 disabled:cursor-not-allowed disabled:opacity-30"
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
                <span>Subtotal</span>
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
