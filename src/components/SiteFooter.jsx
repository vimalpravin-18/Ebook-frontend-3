// src/components/SiteFooter.jsx
export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-white text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="ml-130 font-extrabold text-black">© {new Date().getFullYear()} E‑Bookkiee Store</p>
        <nav className="flex flex-wrap items-center gap-4 text-white/80">
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Terms & Policies</a>
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Privacy</a>
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Refunds</a>
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Delivery</a>
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
