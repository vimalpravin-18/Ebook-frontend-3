import { useEffect, useState, useRef } from 'react'
import { auth } from '../firebase'

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

/* ========== FAVORITES LOGIC ========== */

function useFavorites(key = 'fav_books') {
  const [favs, setFavs] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(favs))
  }, [favs, key])

  const remove = (id) => {
    setFavs(prev => prev.filter(favId => favId !== id))
  }

  return { favs, remove }
}

/* ========== CATALOG DATA ========== */

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
  },
      {
        id: "Confi1",
        title: "Psychology Of Confidence",
        cover: "covers/psychology of confidence image.jpg",
        desc: "Discover your reason for being through Japanese philosophy and self-reflection exercises.",
        price: 14700,
        isFree: false,
        grad: "from-yellow-600 to-orange-600",
        ring: "ring-yellow-400/30",
        sampleUrl: "/samples/Psychology Of Confidenc preview.pdf",
        productId: "68f460ba4ec7a02c82c74c2f",
      }
]

/* ========== HELPER COMPONENTS ========== */

function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function updateProgress() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0
      setProgress(scrolled)
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress()
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

/* ========== FAVORITE CARD COMPONENT ========== */

function FavoriteCard({ book, onRemove, index, isRemoving }) {
  const cardReveal = useReveal(0.1)
  const tiltRef = useTilt(10, true)

  return (
    <article
      ref={cardReveal.ref}
      className={`group relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${
        cardReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${
        isRemoving 
          ? 'animate-[removeFromFavorites_0.8s_ease-in-out_forwards]' 
          : ''
      }`}
      style={{ 
        transitionDelay: `${index * 100}ms`,
        animationDelay: '0s'
      }}
    >
      <div className={`h-1.5 bg-gradient-to-r ${book.grad}`} />

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
          <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Animated heart badge */}
        <div className={`absolute top-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg transition-all duration-300 ${
          isRemoving ? 'animate-[heartBreak_0.6s_ease-in-out]' : 'animate-pulse'
        }`}>
          <span className="text-2xl">{isRemoving ? '💔' : '🤍'}</span>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-300 group-hover:to-rose-300 transition-all duration-300">
            {book.title}
          </h3>
        </div>

        <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-6">
          {book.desc}
        </p>

        {/* Price tag */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-3xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            ₹{(book.price / 100).toFixed(2)}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-pink-500/15 text-pink-300 border border-pink-400/30">
            FAVORITE
          </span>
        </div>

        {/* REMOVE BUTTON */}
        <button
          onClick={onRemove}
          disabled={isRemoving}
          className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-400 hover:via-rose-400 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            isRemoving ? 'animate-pulse' : ''
          }`}
        >
          <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
            {isRemoving ? '💔' : '🤍'}
          </span>
          <span>{isRemoving ? 'Removing...' : 'Remove from Favorites'}</span>
        </button>
      </div>

      {/* Hover glow effect */}
      <div className="pointer-events-none absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${book.grad} blur-xl opacity-3`} />
      </div>
    </article>
  )
}

/* ========== MAIN FAVORITES COMPONENT ========== */

export default function Favorites({ onBackToLibrary }) {
  const { favs, remove } = useFavorites()
  const [removingIds, setRemovingIds] = useState(new Set())
  const headerReveal = useReveal()
  const emptyReveal = useReveal()

  const favBooks = catalogData.filter(book => favs.includes(book.id))

  // Animated removal handler
  const handleRemove = (bookId) => {
    // Add to removing set for animation
    setRemovingIds(prev => new Set([...prev, bookId]))
    
    // Remove after animation completes
    setTimeout(() => {
      remove(bookId)
      setRemovingIds(prev => {
        const next = new Set(prev)
        next.delete(bookId)
        return next
      })
    }, 800) // Match animation duration
  }

  return (
    <>
      <ScrollProgress />

      <div className="relative min-h-screen items-center w-380 text-white bg-[#0a0a0f] overflow-hidden">
        <div className="fixed inset-0 pointer-events-none items-center overflow-hidden">
          <FloatingParticles />
        </div>

        {/* HEADER */}
        <header
          ref={headerReveal.ref}
          className={`relative mx-auto max-w-7xl ml-150 px-6 pt-20 pb-12 transition-all duration-1000 ${
            headerReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center ml-8 gap-3 px-6 py-3 mb-3 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
                <span className="text-2xl animate-pulse">❤️</span>
                <span className="text-sm font-medium text-white/90">Your Collection</span>
                {favBooks.length > 0 && (
                  <span className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold">
                    {favBooks.length}
                  </span>
                )}
              </div>
              <h2 className="text-6xl md:text-7xl -ml-7 font-black tracking-tight mb-4 leading-tight">
                <span className="block bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
                  Favorites
                </span>
              </h2>
              <p className="text-xl text-white/70 -ml-18 max-w-2xl">
                Your curated collection of life-changing reads
              </p>
            </div>
            {typeof onBackToLibrary === 'function' && (
              <button
                onClick={onBackToLibrary}
                className="group px-8 py-4 rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 hover:bg-white/10 hover:border-white/30 font-semibold transition-all duration-300 shadow-xl flex items-center gap-3"
              >
                ← Back to Library
              </button>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <section className="relative mx-auto max-w-7xl px-6 pb-32">
          {favBooks.length === 0 ? (
            <div
              ref={emptyReveal.ref}
              className={`transition-all duration-1000 ${
                emptyReveal.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="max-w-2xl mx-auto text-center py-20">
                <div className="relative inline-block mb-8">
                  <span className="text-8xl animate-bounce">💔</span>
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
                    Browse Library
                    <span className="text-xl">→</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {favBooks.map((book, index) => (
                <FavoriteCard 
                  key={book.id} 
                  book={book} 
                  onRemove={() => handleRemove(book.id)}
                  index={index}
                  isRemoving={removingIds.has(book.id)}
                />
              ))}
            </div>
          )}
        </section>

        
      </div>
    </>
  )
}
