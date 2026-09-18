import { HashRouter, Route, Routes } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { Footer } from './components/Footer'
import { CartProvider } from './context/CartContext'
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { Appointment } from './pages/Appointment'
import { ScrollToTop } from './components/ScrollToTop'

function App() {
  return (
    <CartProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-white">
          <NavBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/appointment" element={<Appointment />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </CartProvider>
  )
}

export default App
