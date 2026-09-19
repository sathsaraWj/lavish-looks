import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { services, timeSlots } from '../data/services'
import { formatLKR } from '../lib/format'
import { readJSON, writeJSON } from '../lib/storage'
import { isMockPreBooked, todayISO } from '../lib/availability'
import { formatMobile } from '../lib/otp'
import { generateReference, normalizeSriLankanMobile } from '../lib/validation'
import { useStageFocus } from '../lib/useStageFocus'
import { DialogPayQr } from '../components/DialogPayQr'
import { MobileVerification } from '../components/MobileVerification'
import { PaymentProcessingModal } from '../components/PaymentProcessingModal'

interface Booking {
  id: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  phone: string
  price: number
  deposit: number
  remaining: number
}

const BOOKINGS_KEY = 'lavish-looks-bookings'

type Stage = 'form' | 'verify' | 'payment' | 'preview'

interface FormErrors {
  serviceId?: string
  date?: string
  time?: string
}

export function Appointment() {
  const [bookings, setBookings] = useState<Booking[]>(() => readJSON(BOOKINGS_KEY, []))
  const [stage, setStage] = useState<Stage>('form')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [previewBooking, setPreviewBooking] = useState<Booking | null>(null)
  const [reference, setReference] = useState('')

  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const headingRef = useStageFocus(stage)

  const selectedService = services.find((s) => s.id === serviceId) ?? null
  const min = todayISO()

  const slotStatus = useMemo(() => {
    return timeSlots.map((t) => {
      const takenByUser = bookings.some((b) => b.date === date && b.time === t)
      const taken = Boolean(date) && (takenByUser || isMockPreBooked(date, t))
      return { time: t, taken }
    })
  }, [date, bookings])

  const deposit = selectedService ? Math.round(selectedService.price * selectedService.depositPercent) : 0
  const remaining = selectedService ? selectedService.price - deposit : 0

  const handleDateChange = (value: string) => {
    setDate(value)
    setTime('')
    setErrors((prev) => ({ ...prev, date: undefined, time: undefined }))
  }

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!serviceId) next.serviceId = 'Please select a service.'
    if (!date) next.date = 'Please select a date.'
    else if (date < min) next.date = 'Please choose today or a future date.'
    if (!time) next.time = 'Please select an available time slot.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !selectedService) return
    setReference(generateReference('APT'))
    setStage('verify')
  }

  const handlePaymentPreviewDone = () => {
    if (!selectedService) return
    setPaymentModalOpen(false)
    const booking: Booking = {
      id: `${Date.now()}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date,
      time,
      phone: normalizeSriLankanMobile(phone) ?? phone.trim(),
      price: selectedService.price,
      deposit,
      remaining,
    }
    const nextBookings = [...bookings, booking]
    setBookings(nextBookings)
    writeJSON(BOOKINGS_KEY, nextBookings)
    setPreviewBooking(booking)
    setStage('preview')
  }

  const resetForm = () => {
    setServiceId('')
    setDate('')
    setTime('')
    setPhone('')
    setErrors({})
    setPreviewBooking(null)
    setReference('')
    setStage('form')
  }

  if (stage === 'preview' && previewBooking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-8">
        <div className="flex items-center justify-between">
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl outline-none">
            Booking Preview
          </h1>
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-burgundy">
            Ref: {reference}
          </span>
        </div>
        <p className="mt-2 text-mauve">Please review your appointment details below.</p>

        <div className="mt-8 rounded-2xl border border-gold-light/40 bg-cream p-6 text-left">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-mauve">Service</dt>
              <dd className="font-semibold text-burgundy">{previewBooking.serviceName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mauve">Date</dt>
              <dd className="font-semibold text-burgundy">{previewBooking.date}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mauve">Time</dt>
              <dd className="font-semibold text-burgundy">{previewBooking.time}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mauve">Dialog Mobile Number</dt>
              <dd className="font-semibold text-burgundy">{formatMobile(previewBooking.phone)}</dd>
            </div>
          </dl>
          <div className="mt-4 space-y-2 border-t border-gold-light/30 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Service Price</span>
              <span>{formatLKR(previewBooking.price)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gold">
              <span>Advance Amount</span>
              <span>{formatLKR(previewBooking.deposit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Balance (at salon)</span>
              <span>{formatLKR(previewBooking.remaining)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full bg-burgundy px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
          >
            Book Another Appointment
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

  if ((stage === 'verify' || stage === 'payment') && selectedService) {
    const onVerifyStep = stage === 'verify'
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <button
          type="button"
          onClick={() => setStage('form')}
          className="text-sm font-semibold uppercase tracking-wide text-burgundy hover:underline"
        >
          ← Back to Details
        </button>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          {onVerifyStep ? 'Step 1 of 2 · Verify your number' : 'Step 2 of 2 · Scan and pay'}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl outline-none">
          Advance Payment
        </h1>
        <div className="mt-6 rounded-2xl bg-cream p-6 text-sm">
          <div className="flex justify-between">
            <span>{selectedService.name}</span>
            <span>{date} · {time}</span>
          </div>
          <div className="mt-3 space-y-2 border-t border-gold-light/30 pt-3">
            <div className="flex justify-between">
              <span>Service Price</span>
              <span>{formatLKR(selectedService.price)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gold">
              <span>Advance Amount ({Math.round(selectedService.depositPercent * 100)}%)</span>
              <span>{formatLKR(deposit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Balance (pay at salon)</span>
              <span>{formatLKR(remaining)}</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          {onVerifyStep ? (
            <MobileVerification
              phone={phone}
              onPhoneChange={setPhone}
              onVerified={() => setStage('payment')}
            />
          ) : (
            <DialogPayQr
              amountLabel="Advance amount due"
              amount={deposit}
              reference={reference}
              onScanned={() => setPaymentModalOpen(true)}
              disabled={paymentModalOpen}
            />
          )}
        </div>
        <PaymentProcessingModal
          open={paymentModalOpen}
          amount={deposit}
          summaryLabel="View booking summary"
          onDone={handlePaymentPreviewDone}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Book Now</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl outline-none sm:text-4xl">
          Make an Appointment
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance">
          Choose your service, pick a convenient date and time, and secure your booking with a
          small advance payment.
        </p>
      </div>

      <form className="mt-10 space-y-8" onSubmit={handleProceedToPayment} noValidate>
        <div>
          <label htmlFor="service" className="block text-sm font-semibold text-burgundy">
            Service
          </label>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value)
              clearError('serviceId')
            }}
            aria-invalid={Boolean(errors.serviceId)}
            aria-describedby={errors.serviceId ? 'service-error' : undefined}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
          >
            <option value="">Select a service…</option>
            {(['Hair Styling & Colouring', 'Skin Treatments', 'Bridal Packages'] as const).map(
              (cat) => (
                <optgroup label={cat} key={cat}>
                  {services
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {formatLKR(s.price)}
                      </option>
                    ))}
                </optgroup>
              ),
            )}
          </select>
          {errors.serviceId && (
            <p id="service-error" className="mt-1 text-xs text-red-600">
              {errors.serviceId}
            </p>
          )}
          {selectedService && (
            <p className="mt-2 text-xs text-mauve">
              Price {formatLKR(selectedService.price)} · Advance required (
              {Math.round(selectedService.depositPercent * 100)}%):{' '}
              <span className="font-semibold text-gold">{formatLKR(deposit)}</span> · Remaining at
              salon: {formatLKR(remaining)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-burgundy">
            Date
          </label>
          <input
            id="date"
            type="date"
            min={min}
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'date-error' : undefined}
            className="mt-2 w-full max-w-xs rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
          />
          {errors.date && (
            <p id="date-error" className="mt-1 text-xs text-red-600">
              {errors.date}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="block text-sm font-semibold text-burgundy">Available Time Slots</legend>
          {!date ? (
            <p className="mt-2 text-sm text-mauve">Select a date to see available time slots.</p>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {slotStatus.map(({ time: t, taken }) => (
                <button
                  key={t}
                  type="button"
                  disabled={taken}
                  onClick={() => {
                    setTime(t)
                    clearError('time')
                  }}
                  aria-pressed={time === t}
                  aria-label={taken ? `${t}, already booked` : `Select ${t}`}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    taken
                      ? 'cursor-not-allowed border-black/5 bg-black/5 text-mauve/50 line-through'
                      : time === t
                        ? 'border-burgundy bg-burgundy text-white'
                        : 'border-burgundy/20 bg-white text-burgundy hover:bg-burgundy/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          {errors.time && (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {errors.time}
            </p>
          )}
        </fieldset>

        <button
          type="submit"
          className="w-full rounded-full bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-light sm:w-auto sm:px-10"
        >
          Continue to Advance Payment
        </button>
      </form>
    </div>
  )
}
