import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { services, timeSlots } from '../data/services'
import { formatLKR } from '../lib/format'
import { readJSON, writeJSON } from '../lib/storage'
import { isMockPreBooked, todayISO } from '../lib/availability'
import { QrDemo } from '../components/QrDemo'
import { DemoNotice } from '../components/DemoNotice'

interface Booking {
  id: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  name: string
  phone: string
  price: number
  deposit: number
  remaining: number
  bookedAt: string
}

const BOOKINGS_KEY = 'lavish-looks-bookings'
const PHONE_PATTERN = /^(?:\+94|0)7\d{8}$/

type Stage = 'form' | 'payment' | 'confirmation'

interface FormErrors {
  serviceId?: string
  date?: string
  time?: string
  name?: string
  phone?: string
}

export function Appointment() {
  const [bookings, setBookings] = useState<Booking[]>(() => readJSON(BOOKINGS_KEY, []))
  const [stage, setStage] = useState<Stage>('form')
  const [processing, setProcessing] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)

  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

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
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!serviceId) next.serviceId = 'Please select a service.'
    if (!date) next.date = 'Please select a date.'
    else if (date < min) next.date = 'Please choose today or a future date.'
    if (!time) next.time = 'Please select an available time slot.'
    if (!name.trim() || name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!PHONE_PATTERN.test(phone.trim()))
      next.phone = 'Enter a valid Sri Lankan mobile number, e.g. 077 123 4567.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !selectedService) return
    setStage('payment')
  }

  const handleSimulatePayment = () => {
    if (!selectedService) return
    setProcessing(true)
    window.setTimeout(() => {
      const booking: Booking = {
        id: `${Date.now()}`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date,
        time,
        name: name.trim(),
        phone: phone.trim(),
        price: selectedService.price,
        deposit,
        remaining,
        bookedAt: new Date().toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }),
      }
      const nextBookings = [...bookings, booking]
      setBookings(nextBookings)
      writeJSON(BOOKINGS_KEY, nextBookings)
      setConfirmedBooking(booking)
      setProcessing(false)
      setStage('confirmation')
    }, 900)
  }

  const resetForm = () => {
    setServiceId('')
    setDate('')
    setTime('')
    setName('')
    setPhone('')
    setErrors({})
    setConfirmedBooking(null)
    setStage('form')
  }

  if (stage === 'confirmation' && confirmedBooking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-3xl text-gold">
          ✓
        </div>
        <h1 className="mt-6 text-3xl">Appointment Confirmed</h1>
        <p className="mt-2 text-mauve">We look forward to seeing you at Lavish Looks!</p>

        <div className="mt-8 rounded-2xl border border-gold-light/40 bg-cream p-6 text-left">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-mauve">Service</dt>
              <dd className="font-semibold text-burgundy">{confirmedBooking.serviceName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mauve">Date</dt>
              <dd className="font-semibold text-burgundy">{confirmedBooking.date}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mauve">Time</dt>
              <dd className="font-semibold text-burgundy">{confirmedBooking.time}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mauve">Name</dt>
              <dd className="font-semibold text-burgundy">{confirmedBooking.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mauve">Contact</dt>
              <dd className="font-semibold text-burgundy">{confirmedBooking.phone}</dd>
            </div>
          </dl>
          <div className="mt-4 space-y-2 border-t border-gold-light/30 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Service Price</span>
              <span>{formatLKR(confirmedBooking.price)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gold">
              <span>Advance Paid Today</span>
              <span>{formatLKR(confirmedBooking.deposit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Balance (at salon)</span>
              <span>{formatLKR(confirmedBooking.remaining)}</span>
            </div>
          </div>
        </div>

        <DemoNotice className="mt-6" />

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

  if (stage === 'payment' && selectedService) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <button
          type="button"
          onClick={() => setStage('form')}
          className="text-sm font-semibold uppercase tracking-wide text-burgundy hover:underline"
        >
          ← Back to Details
        </button>
        <h1 className="mt-4 text-3xl">Pay Advance to Confirm</h1>
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
              <span>Advance Due Now ({Math.round(selectedService.depositPercent * 100)}%)</span>
              <span>{formatLKR(deposit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Balance (pay at salon)</span>
              <span>{formatLKR(remaining)}</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <QrDemo
            amountLabel="Advance payment due"
            amount={deposit}
            reference={`APPT-${selectedService.id}-${date}-${time}`.replace(/\s+/g, '')}
            onSimulatePayment={handleSimulatePayment}
            busy={processing}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Book Now</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">Make an Appointment</h1>
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
            onChange={(e) => setServiceId(e.target.value)}
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

        <div className="grid gap-6 sm:grid-cols-2">
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
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
            />
            {errors.date && (
              <p id="date-error" className="mt-1 text-xs text-red-600">
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-burgundy">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amaya Perera"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>
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
                  onClick={() => setTime(t)}
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

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-burgundy">
            Contact Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
