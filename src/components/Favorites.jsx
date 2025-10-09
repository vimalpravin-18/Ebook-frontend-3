import { useEffect, useMemo, useState, useRef } from 'react'
import { auth } from '../firebase'
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

/* ========== ANIMATION HOOKS ========== */

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
}

function useTilt(maxTilt = 12, glare = true) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    const glareEl = glare ? el.querySelector('.glare-effect') : null
    
    function onMove(e) {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      
      const rotateX = (y - 0.5) * -maxTilt * 2
      const rotateY = (x - 0.5) * maxTilt * 2
      
      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
      
      if (glareEl) {
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.2), transparent 60%)`
        glareEl.style.opacity = '1'
      }
    }
    
    function onLeave() {
      el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
      if (glareEl) glareEl.style.opacity = '0'
    }
    
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [maxTilt, glare])
  return ref
}

/* ========== ANIMATED COMPONENTS ========== */

function FloatingParticles() {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }))
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
        ctx.fill()
      })
      
      requestAnimationFrame(animate)
    }
    
    animate()
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    function updateProgress() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = (window.scrollY / scrollHeight) * 100
      setProgress(scrolled)
    }
    
    window.addEventListener('scroll', updateProgress)
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
      <div 
        className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* ========== FAVORITES LOGIC ========== */

function useFavorites(key = 'fav_books') {
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) }
    catch { return new Set() }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify([...favs]))
  }, [favs, key])

  const remove = (id) =>
    setFavs(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

  const has = (id) => favs.has(id)

  return { favs, has, remove }
}

/* Catalog Data */
const catalogData = [
  {
    id: 'disc1',
    title: 'Psychology of Discipline',
    cover: '/covers/generated-image (1).png',
    desc: 'Master your mindset and build lasting habits with practical frameworks, habit loops, and friction design.',
    price: 900,
    isFree: false,
    sampleUrl: '/samples/discipline-sample.pdf',
    grad: 'from-purple-600 to-pink-600',
    productId: '68e22d1c3afc3781bb387824',
  },
  {
    id: 'focus1',
    title: 'Psychology of Focus',
    cover: '/covers/generated-image (2).png',
    desc: 'Eliminate distractions and achieve deep work with attention-guarding tactics and sprint protocols.',
    price: 15900,
    isFree: false,
    sampleUrl: '/samples/focus-sample.pdf',
    grad: 'from-blue-600 to-cyan-600',
    productId: '68e22d1c3afc3781bb387826',
  },
  {
    id: 'life1',
    title: "The Life You're Meant To Live",
    cover: "covers/The letter i Never sent img.png",
    desc: 'Discover purpose with guided prompts, values mapping, and a 12-week clarity plan.',
    price: 16900,
    isFree: false,
    sampleUrl: '/samples/life-sample.pdf',
    grad: 'from-pink-600 to-rose-600',
    productId: '68e22d1c3afc3781bb387825',
  },
  {
    id: 'side1',
    title: 'The Side Hustle Millionaire',
    cover: '/covers/side hustle cover image.jpg',
    desc: 'Build scalable side projects with offer design, distribution playbooks, and compounding skills.',
    price: 18900,
    isFree: false,
    sampleUrl: '/samples/side-sample.pdf',
    grad: 'from-orange-600 to-amber-600',
    productId: '68e22d1c3afc3781bb387827',
  },
  {
    id: 'min1',
    title: 'Master Your Minutes',
    cover: '/covers/Master Your Minutes.jpg',
    desc: 'Optimize your time with calendar guardrails, batching, and task runway planning.',
    price: 19900,
    isFree: false,
    sampleUrl: '/samples/minutes-sample.pdf',
    grad: 'from-violet-600 to-indigo-600',
    productId: '68e22d1c3afc3781bb387828',
  },
  {
    id: 'habit1',
    title: 'Psychology of Habits',
    cover: 'covers/Psychology of habits cov.jpg',
    desc: 'Build unbreakable habits with science-backed frameworks.',
    price: 12900,
    isFree: false,
    sampleUrl: '/samples/Psychology of Habits.pdf',
    grad: 'from-emerald-600 to-teal-600',
    productId: '68e22d1c3afc3781bb387829',
  },
  {
    id: 'letter1',
    title: 'The Last Letter I Never sent',
    cover: 'covers/The letter i Never sent img.png',
    desc: 'An emotional journey through unsent words.',
    price: 14900,
    isFree: false,
    sampleUrl: '/samples/The Last Letter I Never Sent.pdf',
    grad: 'from-red-600 to-pink-600',
    productId: '68e22d1c3afc3781bb38782a',
  },
  {
    id: 'ikigai1',
    title: 'Unlocking Of My ikigai',
    cover: 'covers/Unlocking My Ikigai Book Cover.png',
    desc: 'Discover your purpose and passion.',
    price: 11900,
    isFree: false,
    sampleUrl: '/samples/Unlocking My Ikigai.pdf',
    grad: 'from-yellow-600 to-orange-600',
    productId: '68e22d1c3afc3781bb38782b'
  }
]

/* ========== MAIN COMPONENT ========== */

export default function Favorites({ onBackToLibrary }) {
  const { favs, has, remove } = useFavorites()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [processingId, setProcessingId] = useState(null)
  const [downloadToken, setDownloadToken] = useState(null)

  const user = auth.currentUser

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const favBooks = useMemo(
    () => catalogData.filter(b => has(b.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favs]
  )

  // Payment Handler
  async function handlePayment(book) {
    if (book.isFree) {
      window.location.href = `/library/free/${book.id}`
      return
    }
    if (processingId) return

    setProcessingId(book.id)
    setDownloadToken(null)

    try {
      if (!RAZORPAY_KEY_ID) {
        alert('Missing VITE_RAZORPAY_KEY_ID in .env')
        return
      }
      const ok = await loadRazorpayScript()
      if (!ok) {
        alert('Razorpay SDK failed to load. Check network.')
        return
      }

      const orderRes = await fetch(`${API_BASE}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ebookId: book.productId,
          userEmail: user?.email || '',
        }),
      })
      if (!orderRes.ok) {
        const t = await orderRes.text()
        throw new Error(`Order creation failed: ${t}`)
      }
      const order = await orderRes.json()
      if (!order?.orderId) {
        alert('Unable to create order.')
        return
      }

      const rzp = new window.Razorpay({
        key: order.razorpayKey || RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Vimal Library',
        description: book.title,
        order_id: order.orderId,
        prefill: { name: user?.displayName || '', email: user?.email || '' },
        theme: { color: '#7c3aed' },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            
            if (!verifyRes.ok) {
              const txt = await verifyRes.text()
              
              // SAVE FAILED TRANSACTION
              saveTransaction(user.uid, {
                id: `txn_fail_${Date.now()}`,
                title: book.title,
                cover: book.cover,
                price: book.price,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: 'failed',
                reason: 'Payment verification failed',
                errorCode: txt || 'VERIFICATION_ERROR',
              })
              
              alert(`Payment verification failed: ${txt}`)
              return
            }
            
            const verifyData = await verifyRes.json()
            
            if (verifyData.success) {
              // SAVE SUCCESSFUL TRANSACTION
              saveTransaction(user.uid, {
                id: `txn_${Date.now()}`,
                title: book.title,
                cover: book.cover,
                price: book.price,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: 'success',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              })
              
              if (verifyData.downloadToken) {
                setDownloadToken(verifyData.downloadToken)
              }
            } else {
              // SAVE FAILED TRANSACTION
              saveTransaction(user.uid, {
                id: `txn_fail_${Date.now()}`,
                title: book.title,
                cover: book.cover,
                price: book.price,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: 'failed',
                reason: 'Payment verification failed',
                errorCode: 'VERIFICATION_FAILED',
              })
              
              alert('Payment verification failed.')
            }
          } catch (err) {
            console.error(err)
            
            // SAVE FAILED TRANSACTION
            saveTransaction(user.uid, {
              id: `txn_fail_${Date.now()}`,
              title: book.title,
              cover: book.cover,
              price: book.price,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              status: 'failed',
              reason: 'Payment verification error',
              errorCode: err.message || 'UNKNOWN_ERROR',
            })
            
            alert('Payment verification error.')
          }
        },
      })

      rzp.open()
    } catch (e) {
      console.error(e)
      
      // SAVE FAILED TRANSACTION
      saveTransaction(user.uid, {
        id: `txn_fail_${Date.now()}`,
        title: book.title,
        cover: book.cover,
        price: book.price,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'failed',
        reason: 'Checkout process failed',
        errorCode: e.message || 'CHECKOUT_ERROR',
      })
      
      alert('Checkout process failed. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const headerReveal = useReveal()
  const emptyReveal = useReveal()

  return (
    <>
      <ScrollProgress />
      
      <div className="relative min-h-screen items-center w-380 text-white bg-[#0a0a0f] overflow-hidden">
        
        {/* Animated gradient orbs */}
        <div className="fixed inset-0 pointer-events-none items-center overflow-hidden">
          <FloatingParticles />
          
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-25"
            style={{
              background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
              left: `${15 + mousePos.x * 0.015}%`,
              top: `${10 + mousePos.y * 0.015}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
          <div 
            className="absolute w-[450px] h-[450px] rounded-full blur-[120px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)',
              right: `${20 + mousePos.x * 0.01}%`,
              bottom: `${15 + mousePos.y * 0.01}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
        </div>

        {/* HEADER SECTION */}
        <header
          ref={headerReveal.ref}
          className={`relative mx-auto max-w-7xl ml-150 px-6 pt-20 pb-12 transition-all duration-1000 ${
            headerReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center ml-8 gap-3 px-6 py-3 mb-3 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
                <span className="text-2xl">❤️</span>
                <span className="text-sm font-medium text-white/90 ">Your Collection</span>
              </div>
              
              {/* Main heading */}
              <h2 className="text-6xl md:text-7xl -ml-7 font-black tracking-tight mb-4 leading-tight">
                <span className="block bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
                  Favorites
                </span>
              </h2>
              
              <p className="text-xl text-white/70 -ml-18 max-w-2xl">
                Your curated collection of life-changing reads
              </p>
            </div>

            {/* Back Button */}
            {typeof onBackToLibrary === 'function' && (
              <button
                onClick={onBackToLibrary}
                className="group px-8 py-4 rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 hover:bg-white/10 hover:border-white/30 font-semibold transition-all duration-300 shadow-xl flex items-center gap-3"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Library
              </button>
            )}
          </div>
        </header>

        {/* CONTENT SECTION */}
        <section className="relative mx-auto max-w-7xl px-6 pb-32">
          {favBooks.length === 0 ? (
            // EMPTY STATE
            <div 
              ref={emptyReveal.ref}
              className={`transition-all duration-1000 ${
                emptyReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="max-w-2xl mx-auto text-center py-20">
                <div className="relative inline-block mb-8">
                  {/* Animated heart icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full blur-2xl opacity-50 animate-pulse" />
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                      <span className="text-6xl animate-bounce">💔</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  No Favorites Yet
                </h3>
                
                <p className="text-xl text-white/60 mb-10 leading-relaxed">
                  Start building your collection of inspiring ebooks.<br />
                  Click the heart icon on any book to save it here.
                </p>
                
                {typeof onBackToLibrary === 'function' && (
                  <button
                    onClick={onBackToLibrary}
                    className="group px-10 py-5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-bold text-lg shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6)] transition-all duration-300 inline-flex items-center gap-3 hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Browse Library
                  </button>
                )}
              </div>
            </div>
          ) : (
            // FAVORITES GRID
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {favBooks.map((book, index) => {
                const cardReveal = useReveal(0.1)
                const tiltRef = useTilt(10, true)
                const busy = processingId === book.id
                
                return (
                  <article
                    key={book.id}
                    ref={cardReveal.ref}
                    className={`group relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${
                      cardReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Top accent bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${book.grad}`} />

                    {/* Book cover with 3D tilt */}
                    <div 
                      ref={tiltRef} 
                      className="relative p-6 transition-transform duration-300"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className={`relative h-72 rounded-2xl bg-gradient-to-br ${book.grad} flex items-center justify-center overflow-hidden shadow-2xl`}>
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="object-contain max-h-full max-w-full drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        
                        {/* Glare effect */}
                        <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none" />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-300 group-hover:to-rose-300 transition-all duration-300">
                          {book.title}
                        </h3>
                        
                        {/* Remove button */}
                        <button
                          onClick={() => remove(book.id)}
                          className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-xl border border-pink-500/30 hover:from-pink-500/30 hover:to-rose-500/30 hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl"
                          aria-label="Remove from favorites"
                          title="Remove from favorites"
                        >
                          ❤️
                        </button>
                      </div>

                      <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-6">
                        {book.desc}
                      </p>

                      {/* Price and badges */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className={`text-3xl font-black ${book.isFree ? 'text-emerald-400' : 'bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent'}`}>
                            {book.isFree ? 'Free' : `₹${(book.price / 100).toFixed(2)}`}
                          </span>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              book.isFree
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                                : 'bg-pink-500/15 text-pink-300 border border-pink-400/30'
                            }`}
                          >
                            {book.isFree ? 'FREE' : 'PREMIUM'}
                          </span>
                        </div>
                      </div>

                      {/* Buy Now button */}
                      <button
                        onClick={() => handlePayment(book)}
                        disabled={busy}
                        className={`w-full px-6 py-4 rounded-xl text-center font-bold bg-gradient-to-r ${book.grad} hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
                      >
                        {book.isFree ? (
                          busy ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Opening...
                            </>
                          ) : (
                            <>🎁 Get Free</>
                          )
                        ) : busy ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>🛒 Buy Now</>
                        )}
                      </button>
                    </div>

                    {/* Hover glow effect */}
                    <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${book.grad} blur-xl opacity-30`} />
                    </div>
                  </article>
                  
                )
              })}
            </div>
          )}

            <footer className="relative py-16 px-6 mt-25 -mb-30 border-t border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <div className="text-2xl font-black mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Your Library
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  Premium digital ebooks for ambitious creators and coders. Built with passion for readers who lead.
                </p>
              </div>
              
              <div>
                <div className="text-sm font-bold text-white/80 mb-4 uppercase tracking-wider">Quick Links</div>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><a href="#" className="hover:text-purple-300 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-purple-300 transition-colors">All Books</a></li>
                  <li><a href="#" className="hover:text-purple-300 transition-colors">Authors</a></li>
                  <li><a href="#" className="hover:text-purple-300 transition-colors">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <div className="text-sm font-bold text-white/80 mb-4 uppercase tracking-wider">Connect</div>
                <div className="flex gap-4">
                  {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                    <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center text-sm">
                      {social[0]}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10 text-center text-white/50 text-sm">
              © 2025 Your Ebook Library. Built with passion for readers who lead.
            </div>
          </div>
        </footer>
        </section>

        {/* SUCCESS MODAL */}
        {downloadToken && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="relative max-w-2xl w-full rounded-3xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-2xl border-2 border-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.4)] p-10">
              
              {/* Success Icon */}
              <div className="text-center mb-8">
                <div className="inline-flex w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-400/50 items-center justify-center mb-6 animate-bounce">
                  <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-4xl font-black text-white mb-3">
                  Payment Successful! 🎉
                </h3>
                <p className="text-xl text-white/80">
                  Your ebook is ready for download
                </p>
              </div>

              {/* Download Button */}
              <a
                href={`${API_BASE}/download/${downloadToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-10 py-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-black text-xl text-center shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_rgba(16,185,129,0.7)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-4"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Ebook Now
              </a>

              {/* Timer Warning */}
              <div className="mt-6 text-center">
                <p className="text-sm text-emerald-300/80 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Link valid for 10 minutes
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setDownloadToken(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>


              {/* Decorative elements */}
              
            </div>
          </div>
          
        )}
      </div>

      
    </>
    
  )
}
