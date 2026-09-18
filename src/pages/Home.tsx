import { Link } from 'react-router-dom'
import { QrDemo } from '../components/QrDemo'
import storefrontPhoto from '../assets/salon/storefront.jpg'
import vanityStationPhoto from '../assets/salon/vanity-station.jpg'
import interiorPhoto from '../assets/salon/interior.jpg'

const serviceHighlights = [
  {
    title: 'Hair Styling & Colouring',
    description:
      'From precision cuts to bespoke colour and balayage, our stylists craft looks that suit you.',
    image:
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?auto=format&fit=crop&w=800&q=80',
    from: 3500,
  },
  {
    title: 'Skin Treatments',
    description:
      'Rejuvenating facials and radiance treatments using premium, skin-loving ingredients.',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    from: 6000,
  },
  {
    title: 'Bridal Packages',
    description:
      'Trials to full wedding-day hair and makeup — so you look effortlessly radiant on your day.',
    image:
      'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80',
    from: 8000,
  },
]

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={interiorPhoto} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-burgundy/90 via-burgundy/70 to-burgundy/40" />
        </div>
        <div className="relative mx-auto flex min-h-[560px] max-w-6xl flex-col justify-center px-4 py-24 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            Meegoda, Sri Lanka
          </p>
          <h1 className="mt-4 max-w-xl text-balance font-serif text-4xl font-semibold text-white sm:text-6xl">
            Lavish Looks Salon
          </h1>
          <p className="mt-6 max-w-lg text-balance text-lg text-white/85">
            A premium hair &amp; beauty studio offering expert styling, colouring, skin
            treatments and bridal artistry — tailored to make you feel radiant.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="rounded-full bg-gold px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-light"
            >
              Shop Products
            </Link>
            <Link
              to="/appointment"
              className="rounded-full border border-white/70 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-burgundy"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Welcome</p>
        <h2 className="mt-4 text-3xl sm:text-4xl">Where every visit feels lavish</h2>
        <p className="mx-auto mt-6 max-w-2xl text-balance leading-relaxed">
          Since opening our doors in Meegoda, Lavish Looks has become a trusted destination for
          clients who want expert craftsmanship paired with a warm, personal touch. Our senior
          stylists and beauty therapists combine premium products with meticulous technique —
          whether you're here for a quick refresh or your full bridal transformation.
        </p>
      </section>

      {/* Services */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Signature Services
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Crafted for you</h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {serviceHighlights.map((service) => (
              <div
                key={service.title}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 text-left">
                  <h3 className="text-xl">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{service.description}</p>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-gold">
                    From LKR {service.from.toLocaleString('en-US')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/appointment"
              className="inline-block rounded-full bg-burgundy px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-burgundy-light"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Visit Our Salon gallery */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Visit Us</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">Step Inside Lavish Looks</h2>
          <p className="mx-auto mt-4 max-w-xl text-balance">
            Find us in Meegoda for a relaxed, elegant space designed around you.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:grid-rows-2">
          <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 lg:row-span-2">
            <img
              src={interiorPhoto}
              alt="Lavish Looks salon interior with styling chairs and a lit vanity mirror"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
            <img
              src={storefrontPhoto}
              alt="Lavish Looks salon storefront signage in Meegoda"
              className="h-56 w-full object-cover sm:h-full"
            />
          </div>
          <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
            <img
              src={vanityStationPhoto}
              alt="Makeup and styling station with brushes and cosmetics"
              className="h-56 w-full object-cover sm:h-full"
            />
          </div>
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-mauve">
            No. 203/1, Puwakwaththa Road, Meegoda · Call us on 075 299 4812
          </p>
        </div>
      </section>

      {/* Dialog Pay QR proposal */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Introducing
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Pay instantly with Dialog Pay QR</h2>
            <p className="mt-6 leading-relaxed">
              We're proposing Dialog Pay QR as a fast, convenient way for clients to pay their
              booking deposit or product order — no cash handling, no card machine queues, just a
              quick scan-and-pay from any banking app.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Instant, contactless payments at checkout or booking
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Reduces cash handling and speeds up front-desk service
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Works with any bank app that supports LankaQR / Dialog Pay
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Try it now on our Shop and Booking pages
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-light"
              >
                See it in Checkout
              </Link>
              <Link
                to="/appointment"
                className="rounded-full border border-burgundy/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-burgundy transition hover:bg-burgundy/5"
              >
                See it in Booking
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <QrDemo
              amountLabel="Sample amount due"
              amount={3500}
              reference="PREVIEW-0001"
              onContinue={() => {}}
              readOnly
            />
          </div>
        </div>
      </section>
    </div>
  )
}
