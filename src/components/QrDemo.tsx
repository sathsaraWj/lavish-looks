import dialogPayQr from '../assets/payment/dialog-pay-qr.jpg'

interface QrDemoProps {
  amountLabel: string
  amount: number
  payee?: string
  reference: string
  onScanned: () => void
  disabled?: boolean
  readOnly?: boolean
}

export function QrDemo({
  amountLabel,
  amount,
  payee = 'Lavish Looks Salon',
  reference,
  onScanned,
  disabled = false,
  readOnly = false,
}: QrDemoProps) {
  return (
    <div className="rounded-2xl border border-gold-light/40 bg-cream p-6 sm:p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-burgundy px-4 py-1 text-xs font-medium uppercase tracking-widest text-white">
          Dialog Pay QR
        </span>
        <img
          src={dialogPayQr}
          alt="Dialog Pay QR code"
          className="aspect-square w-full max-w-[220px] rounded-lg bg-white p-3 shadow-inner"
        />
        <div>
          <p className="text-sm text-mauve">{amountLabel}</p>
          <p className="font-serif text-3xl font-semibold text-burgundy">
            LKR {Math.round(amount).toLocaleString('en-US')}
          </p>
        </div>
        <div className="text-xs text-mauve">
          <p>Pay to: {payee}</p>
          <p>Reference: {reference}</p>
        </div>
        <p className="max-w-xs text-xs text-mauve">
          Open your banking app and scan this code to pay with Dialog Pay QR.
        </p>
        <button
          type="button"
          onClick={onScanned}
          disabled={disabled || readOnly}
          className="mt-2 w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
        >
          I&rsquo;ve Scanned the QR Code
        </button>
        {readOnly && <p className="text-xs text-mauve">Try it on the Shop or Booking page.</p>}
      </div>
    </div>
  )
}
