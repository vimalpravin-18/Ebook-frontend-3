import { useMemo, useRef, useState, useEffect } from 'react'

/* ====== ENV ====== */
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID
const API_BASE = import.meta.env.VITE_API_BASE || '' // e.g., http://localhost:5000

/* ====== SDK LOADER ====== */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
} // [web:179]

/* ====== UI HOOKS ====== */
function useReveal(threshold = 0.12) {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.unobserve(entry.target)
        }
      },
      { threshold }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold])
  return { ref, inView }
} // [web:179]

function useTilt(maxTilt = 8, scale = 1.03) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = () => el.getBoundingClientRect()
    const onMove = (e) => {
      const r = rect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      const rx = (py - 0.5) * -2 * maxTilt
      const ry = (px - 0.5) * 2 * maxTilt
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
    }
    const reset = () => (el.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)')
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', reset)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', reset)
    }
  }, [maxTilt, scale])
  return ref
} // [web:179]

/* ====== FAVORITES (localStorage) ====== */
function useFavorites(key = 'fav_books') {
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) }
    catch { return new Set() }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify([...favs]))
  }, [favs, key])
  const toggle = (id) =>
    setFavs(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const has = (id) => favs.has(id)
  return { favs, has, toggle }
}

/* ====== PAGE ====== */
export default function Payment({ user }) {
  // Search with debounce (keep input controlled)
  const [searchTerm, setSearchTerm] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebounced(searchTerm.trim().toLowerCase()), 250)
    return () => clearTimeout(id)
  }, [searchTerm]) // [web:299][web:213]

  // Preview modal
  const [preview, setPreview] = useState(null)

  // Per-item processing state
  const [processingId, setProcessingId] = useState(null)

  // Favorites
  const { has: isFav, toggle: toggleFav } = useFavorites()

  // Lock body scroll when preview is open
  useEffect(() => {
    if (preview) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [preview]) // [web:179]

  // Books data
  const books = useMemo(
    () => [
      {
        id: 'disc1',
        title: 'Psychology of Discipline',
        cover: '/covers/generated-image (1).png',
        desc: 'Master your mindset and build lasting habits with practical frameworks, habit loops, and friction design.',
        price: 1000,
        isFree: false,
        grad: 'from-sky-500 to-fuchsia-600',
        ring: 'ring-sky-400/40',
        sampleUrl: '/samples/discipline-sample.pdf',
        productId: 'prod_disc1',
      },
      {
        id: 'focus1',
        title: 'Psychology of Focus',
        cover: '/covers/generated-image (2).png',
        desc: 'Eliminate distractions and achieve deep work with attention-guarding tactics and sprint protocols. This will increase your focus to get better in everytime.',
        price: 15900,
        isFree: false,
        grad: 'from-emerald-500 to-cyan-500',
        ring: 'ring-cyan-400/40',
        sampleUrl: '/samples/focus-sample.pdf',
        productId: 'prod_focus1',
      },
      {
        id: 'life1',
        title: "The Life You're Meant To Live",
        cover: "/covers/The Life You’re Meant to Live book cover.jpg",
        desc: 'Discover purpose with guided prompts, values mapping, and a 12-week clarity plan.',
        price: 32900,
        isFree: false,
        grad: 'from-pink-500 to-rose-600',
        ring: 'ring-pink-400/40',
        sampleUrl: '/samples/life-sample.pdf',
        productId: 'prod_life1',
      },
      {
        id: 'side1',
        title: 'The Side Hustle Millionaire',
        cover: '/covers/side hustle cover image.jpg',
        desc: 'Build scalable side projects with offer design, distribution playbooks, and compounding skills.',
        price: 49900,
        isFree: false,
        grad: 'from-orange-500 to-amber-600',
        ring: 'ring-amber-400/40',
        sampleUrl: '/samples/side-sample.pdf',
        productId: 'prod_side1',
      },
      {
        id: 'min1',
        title: 'Master Your Minutes',
        cover: '/covers/Master Your Minutes.jpg',
        desc: 'Optimize your time with calendar guardrails, batching, and task runway planning.',
        price: 29900,
        isFree: false,
        grad: 'from-violet-500 to-indigo-600',
        ring: 'ring-indigo-400/40',
        sampleUrl: '/samples/minutes-sample.pdf',
        productId: 'prod_min1',
      },
    ],
    []
  ) // [web:179]

  const filteredBooks = books.filter((b) => {
    if (!debounced) return true
    const t = b.title.toLowerCase()
    const d = b.desc.toLowerCase()
    return t.includes(debounced) || d.includes(debounced)
  })

  async function handlePayment(book) {
    if (book.isFree) {
      window.location.href = `/library/free/${book.id}`
      return
    }
    if (processingId) return
    setProcessingId(book.id)
    try {
      if (!RAZORPAY_KEY_ID) {
        alert('Missing VITE_RAZORPAY_KEY_ID in .env')
        return
      }
      const ok = await loadRazorpayScript()
      if (!ok) {
        alert('Razorpay SDK failed to load. Check network.')
        return
      } // [web:179]

      // 1) Create order on server
      const orderRes = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: book.price,
          currency: 'INR',
          productId: book.productId,
          title: book.title,
        }),
      })
      if (!orderRes.ok) {
        const t = await orderRes.text()
        throw new Error(`Order create failed: ${t}`)
      }
      const order = await orderRes.json()
      if (!order?.id) {
        alert('Unable to create order.')
        return
      }

      // 2) Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        name: 'Vimal Library',
        description: book.title,
        image: '/covers/logo.png',
        order_id: order.id,
        prefill: { name: user?.displayName || '', email: user?.email || '' },
        notes: { productId: book.productId, title: book.title },
        theme: { color: '#7c3aed' },
        handler: async function (response) {
          const verifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.id,
              productId: book.productId,
            }),
          })
          if (!verifyRes.ok) {
            const txt = await verifyRes.text()
            alert(`Verification failed: ${txt}`)
            return
          }
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            window.location.href = `/library/access/${verifyData.entitlementId}`
          } else {
            alert('Payment verification failed.')
          }
        },
        modal: { ondismiss: () => {} },
      })
      rzp.open() // [web:179]
    } catch (e) {
      console.error(e)
      alert('Checkout failed. Try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const headerReveal = useReveal()
  const gridReveal = useReveal()

  return (
    <div className="relative min-h-screen w-348 text-white bg-gradient-to-b from-gray-900 via-gray-950 to-black overflow-hidden">
      {/* Subtle backdrop accents */}
      <div className="pointer-events-none absolute -z-10 inset-0">
        <div className="absolute -top-24 -left-24 w-[36rem] h-[36rem] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-24 w-[30rem] h-[30rem] bg-white/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header
        ref={headerReveal.ref}
        className={`mx-auto max-w-7xl px-1 pt-16 pb-8 transition-all duration-700 ${
          headerReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-white/80">Library</span>
        </div>
        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight will-change-transform">
          Discover. Preview. <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-500">Own</span>.
        </h1>
        <p className="mt-3 text-white/80 max-w-2xl">
          Curated ebooks on discipline, focus, and execution—optimized for reading and doing.
        </p>

        {/* Search */}
        <div className="mt-6">
          <input
            type="search"
            placeholder="Search e-books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-100 max-w-348 p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-white placeholder-white/50"
          />
        </div>
      </header>

      {/* Grid */}
      <section
        ref={gridReveal.ref}
        className={`mx-auto w-339 px-2 pb-24 transition-all duration-700 ${
          gridReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.length ? (
            filteredBooks.map((book) => {
              const cardReveal = useReveal()
              const tiltRef = useTilt(8, 1.05)
              const busy = processingId === book.id
              return (
                <article
                  key={book.id}
                  ref={cardReveal.ref}
                  className={`relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md ring-1 ${book.ring} shadow-2xl transition-all duration-700 ${
                    cardReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  {/* Accent bar */}
                  <div className={`h-1 bg-gradient-to-r ${book.grad}`} />

                  {/* Visual */}
                  <div ref={tiltRef} className="relative p-5 transition-transform duration-300 will-change-transform">
                    <div className={`relative h-56 rounded-xl bg-gradient-to-br ${book.grad} flex items-center justify-center`}>
                      <img
                        src={book.cover}
                        alt={`${book.title} cover`}
                        className="object-contain max-h-full max-w-full drop-shadow-2xl"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 rounded-xl bg-black/0 hover:bg-black/5 transition-colors" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-6 -mt-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-extrabold tracking-tight">{book.title}</h3>
                      <button
                        onClick={() => toggleFav(book.id)}
                        aria-label={isFav(book.id) ? 'Remove from favorites' : 'Add to favorites'}
                        className=" rounded-lg bg-white scale-120 border-white hover:scale-130 w-15 h-12 text-white font-extrabold transition-100"
                        title={isFav(book.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFav(book.id) ? '❤️' : '♡'}
                      </button>
                    </div>

                    <p className="mt-2 text-white/80 leading-relaxed line-clamp-3 ">{book.desc}</p>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-emerald-400">
                          {book.isFree} ₹{(book.price / 100).toFixed(2)}
                        </span>
                        <span
                          className={`px-1 py-1 rounded-full text-xs font-medium
                            ${book.isFree
                              ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30'
                              : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30'}`}
                        >
                          {book.isFree ? 'Free' : 'Paid'}
                        </span>
                      </div>

                      <div className=" mt-2 px-2 flex gap-3">
                        <button
                          onClick={() => setPreview(book)}
                          className="px-4 py-1 border-2 font-semibold bg-white border-white/15 hover:bg-white transition-colors"
                          title="Preview this ebook"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handlePayment(book)}
                          disabled={busy}
                          className="px-5 py-2 rounded-lg font-bold text-black bg-gradient-to-r from-amber-300 to-rose-400 hover:from-amber-400 hover:to-rose-500 shadow-lg transition-colors disabled:opacity-50"
                        >
                          {book.isFree ? (busy ? 'Opening...' : 'Get Free') : busy ? 'Processing...' : 'Buy Now'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Outer glow on hover */}
                  <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${book.grad} blur-md opacity-20`} />
                  </div>
                </article>
              )
            })
          ) : (
            <p className="text-center text-white col-span-full">No e-books found for “{searchTerm}”.</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-white/70">
          All e-books include lifetime access, updates, and exclusive member benefits.
        </div>
      </section>

      {/* Preview Modal — full-width PDF preview only */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-neutral-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-white/10 shadow-[0_10px_60px_rgba(0,0,0,0.6)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src={preview.cover} alt="" className="w-10 h-10 object-cover rounded" />
                <div>
                  <h4 className="text-base md:text-lg font-bold">{preview.title}</h4>
                  <div className="text-emerald-400 font-semibold">
                    {preview.isFree ? 'Free' : `₹${(preview.price / 100).toFixed(1)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePayment(preview)}
                  disabled={processingId === preview.id}
                  className="px-4 py-2 rounded-lg font-bold text-black bg-gradient-to-r from-amber-300 to-rose-400 hover:from-amber-400 hover:to-rose-500 shadow-lg transition-colors disabled:opacity-50"
                >
                  {preview.isFree
                    ? processingId === preview.id ? 'Opening...' : 'Get Free'
                    : processingId === preview.id ? 'Processing...' : 'Buy Now'}
                </button>
                <button onClick={() => setPreview(null)} className="px-3 py-1 rounded hover:bg-white/10">
                  Close
                </button>
              </div>
            </div>

            {/* Full-width PDF */}
            <div className="w-full h-full bg-black">
              <embed src="/src/components/Psychology of Discipline pdf format.pdf" type="application/pdf" className="w-full h-full" />
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
