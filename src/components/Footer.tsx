export function Footer() {
  return (
    <footer className="border-t border-gold-light/20 bg-burgundy text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-8">
        <div>
          <p className="font-serif text-xl font-semibold text-white">Lavish Looks Salon</p>
          <p className="mt-2 text-sm text-cream/70">
            Premium hair &amp; beauty studio bringing elegant, personalised care to Meegoda.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-light">Visit Us</p>
          <address className="mt-2 not-italic text-sm text-cream/70">
            No. 24, Highlevel Road
            <br />
            Meegoda, Sri Lanka
            <br />
            Open daily 9:00 AM – 7:00 PM
          </address>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-light">Contact</p>
          <p className="mt-2 text-sm text-cream/70">
            +94 71 234 5678
            <br />
            hello@lavishlooks.lk
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Lavish Looks Salon. All rights reserved.
      </div>
    </footer>
  )
}
