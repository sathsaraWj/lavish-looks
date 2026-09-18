import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap text-xs sm:text-sm uppercase tracking-wide transition hover:text-burgundy ${
    isActive ? 'text-burgundy font-semibold' : 'text-mauve'
  }`

export function NavBar() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-gold-light/20 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        <NavLink to="/" className="flex flex-col leading-tight">
          <span className="font-serif text-lg font-semibold text-burgundy sm:text-2xl">
            Lavish Looks
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.2em] text-gold sm:block">
            Meegoda, Sri Lanka
          </span>
        </NavLink>

        <nav className="flex items-center gap-3 sm:gap-8" aria-label="Main navigation">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/appointment" className={navLinkClass}>
            Book Now
          </NavLink>
          <NavLink
            to="/products"
            aria-label={`View cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            className="relative rounded-full border border-burgundy/20 p-2 text-burgundy transition hover:bg-burgundy/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.693 2.602-7.153.075-.303-.155-.597-.467-.597H5.106M7.5 14.25 5.106 5.106M9.75 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm9 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[11px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
