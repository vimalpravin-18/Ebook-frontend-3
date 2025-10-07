import { useState, useEffect, useRef } from 'react'
import { auth } from '../firebase'

/* ========== ANIMATION HOOKS (keep same) ========== */

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

/* ========== ANIMATED COMPONENTS (keep same) ========== */

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
        className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* ========== TRANSACTION STORAGE HELPERS ========== */

// Save transaction to localStorage with user ID
function saveTransaction(userId, transaction) {
  try {
    const key = `transactions_${userId}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    existing.unshift(transaction) // Add to beginning
    localStorage.setItem(key, JSON.stringify(existing))
  } catch (error) {
    console.error('Error saving transaction:', error)
  }
}

// Get all transactions for a user
function getUserTransactions(userId) {
  try {
    const key = `transactions_${userId}`
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch (error) {
    console.error('Error loading transactions:', error)
    return []
  }
}

/* ========== MAIN COMPONENT ========== */

export default function Cart() {
  const [activeTab, setActiveTab] = useState('success')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [transactions, setTransactions] = useState({ success: [], failed: [] })
  const [loading, setLoading] = useState(true)

  const user = auth.currentUser

  // Load user transactions on mount
  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  // Listen for storage changes (when new transactions are added)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === `transactions_${user?.uid}`) {
        loadTransactions()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user])

  const loadTransactions = () => {
    if (!user) return
    
    setLoading(true)
    const allTransactions = getUserTransactions(user.uid)
    
    // Separate into success and failed
    const successfulPurchases = allTransactions.filter(t => t.status === 'success')
    const failedPurchases = allTransactions.filter(t => t.status === 'failed')
    
    setTransactions({
      success: successfulPurchases,
      failed: failedPurchases
    })
    setLoading(false)
  }

  const handleRetryPayment = (failedTransaction) => {
    // Redirect to library with the book info
    alert(`Redirecting to retry payment for: ${failedTransaction.title}`)
    // You can add navigation logic here to go back to Payment page
  }

  const handleDownload = (transaction) => {
    // Implement download logic
    alert(`Downloading: ${transaction.title}`)
    // You can add actual download logic here
  }

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const hero = useReveal()
  const content = useReveal()

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-xl">Loading transactions...</div>
      </div>
    )
  }

  return (
    <>
      <ScrollProgress />
      
      <div className="relative min-h-screen w-full text-white bg-[#0a0a0f] overflow-hidden">
        
        {/* Animated gradient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <FloatingParticles />
          
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-25"
            style={{
              background: activeTab === 'success'
                ? 'radial-gradient(circle, #10b981 0%, transparent 70%)'
                : 'radial-gradient(circle, #ef4444 0%, transparent 70%)',
              left: `${15 + mousePos.x * 0.015}%`,
              top: `${10 + mousePos.y * 0.015}%`,
              transition: 'all 0.5s ease-out'
            }}
          />
          <div 
            className="absolute w-[450px] h-[450px] rounded-full blur-[120px] opacity-20"
            style={{
              background: activeTab === 'success'
                ? 'radial-gradient(circle, #34d399 0%, transparent 70%)'
                : 'radial-gradient(circle, #f87171 0%, transparent 70%)',
              right: `${20 + mousePos.x * 0.01}%`,
              bottom: `${15 + mousePos.y * 0.01}%`,
              transition: 'all 0.5s ease-out'
            }}
          />
        </div>

        {/* HERO SECTION */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-6 py-20">
          <div 
            ref={hero.ref}
            className={`text-center max-w-5xl transition-all duration-1000 ${
              hero.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <span className="text-sm font-medium text-white/90">Transaction History</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              <span className="block bg-gradient-to-br from-white to-white/90 bg-clip-text text-transparent">
                Your Cart &
              </span>
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Purchase History
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mt-8 text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              View your successful purchases and failed transactions
            </p>
          </div>
        </section>

        {/* TAB NAVIGATION */}
        <section className="relative px-6 pb-12">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-center gap-4">
              {/* Success Tab */}
              <button
                onClick={() => setActiveTab('success')}
                className={`group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  activeTab === 'success'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-105'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  Payment Success
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === 'success' 
                      ? 'bg-white/20' 
                      : 'bg-green-500/20 text-green-300'
                  }`}>
                    {transactions.success.length}
                  </span>
                </span>
                
                {activeTab === 'success' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
                )}
              </button>

              {/* Failed Tab */}
              <button
                onClick={() => setActiveTab('failed')}
                className={`group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  activeTab === 'failed'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-105'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  Payment Failed
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === 'failed' 
                      ? 'bg-white/20' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {transactions.failed.length}
                  </span>
                </span>
                
                {activeTab === 'failed' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-red-400 to-rose-400 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <section 
          ref={content.ref}
          className={`relative px-6 pb-32 transition-all duration-1000 ${
            content.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="mx-auto max-w-7xl">
            
            {/* SUCCESS VIEW */}
            {activeTab === 'success' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                {transactions.success.length === 0 ? (
                  // Empty state
                  <div className="text-center py-20">
                    <div className="inline-block p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Successful Purchases Yet</h3>
                      <p className="text-white/60">Your successful transactions will appear here</p>
                    </div>
                  </div>
                ) : (
                  transactions.success.map((item, idx) => {
                    const tiltCard = useTilt(8, true)
                    return (
                      <div key={item.id} style={{ animationDelay: `${idx * 100}ms` }}>
                        <div
                          ref={tiltCard}
                          className="group relative p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-[0_20px_60px_rgba(16,185,129,0.3)] transition-all duration-500"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Book Cover */}
                            <div className="flex-shrink-0">
                              <div className="relative w-32 h-40 rounded-xl overflow-hidden shadow-lg">
                                <img
                                  src={item.cover}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-2xl font-black text-white mb-2">{item.title}</h3>
                                  <div className="flex items-center gap-3 text-sm text-white/60">
                                    <span>📅 {item.date}</span>
                                    <span>•</span>
                                    <span>🕐 {item.time}</span>
                                  </div>
                                </div>
                                
                                {/* Success Badge */}
                                <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-bold flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                  Success
                                </div>
                              </div>

                              {/* Transaction Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="p-3 rounded-lg bg-white/5">
                                  <div className="text-xs text-white/50 mb-1">Amount Paid</div>
                                  <div className="text-lg font-bold text-green-400">₹{(item.price / 100).toFixed(2)}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5">
                                  <div className="text-xs text-white/50 mb-1">Payment ID</div>
                                  <div className="text-sm font-semibold text-white/90 font-mono truncate">{item.paymentId}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5">
                                  <div className="text-xs text-white/50 mb-1">Order ID</div>
                                  <div className="text-sm font-semibold text-white/90 font-mono truncate">{item.orderId}</div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-3">
                                <button 
                                  onClick={() => handleDownload(item)}
                                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Download
                                </button>
                                <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-sm transition-all duration-300">
                                  View Receipt
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Glare effect */}
                          <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* FAILED VIEW */}
            {activeTab === 'failed' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left duration-500">
                {transactions.failed.length === 0 ? (
                  // Empty state
                  <div className="text-center py-20">
                    <div className="inline-block p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
                      <div className="text-6xl mb-4">✨</div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Failed Transactions</h3>
                      <p className="text-white/60">All your payments have been successful!</p>
                    </div>
                  </div>
                ) : (
                  transactions.failed.map((item, idx) => {
                    const tiltCard = useTilt(8, true)
                    return (
                      <div key={item.id} style={{ animationDelay: `${idx * 100}ms` }}>
                        <div
                          ref={tiltCard}
                          className="group relative p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-red-500/20 shadow-2xl hover:shadow-[0_20px_60px_rgba(239,68,68,0.3)] transition-all duration-500"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Book Cover */}
                            <div className="flex-shrink-0">
                              <div className="relative w-32 h-40 rounded-xl overflow-hidden shadow-lg opacity-75">
                                <img
                                  src={item.cover}
                                  alt={item.title}
                                  className="w-full h-full object-cover grayscale"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent" />
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-2xl font-black text-white mb-2">{item.title}</h3>
                                  <div className="flex items-center gap-3 text-sm text-white/60">
                                    <span>📅 {item.date}</span>
                                    <span>•</span>
                                    <span>🕐 {item.time}</span>
                                  </div>
                                </div>
                                
                                {/* Failed Badge */}
                                <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                  Failed
                                </div>
                              </div>

                              {/* Error Details */}
                              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">⚠️</span>
                                  <div className="flex-1">
                                    <div className="text-sm font-bold text-red-300 mb-1">Payment Failed</div>
                                    <div className="text-sm text-white/70 mb-2">{item.reason}</div>
                                    <div className="text-xs text-white/50 font-mono">{item.errorCode}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Amount Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="p-3 rounded-lg bg-white/5">
                                  <div className="text-xs text-white/50 mb-1">Attempted Amount</div>
                                  <div className="text-lg font-bold text-white/70">₹{(item.price / 100).toFixed(2)}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5">
                                  <div className="text-xs text-white/50 mb-1">Status</div>
                                  <div className="text-sm font-semibold text-red-400">Transaction Failed</div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-3">
                                <button 
                                  onClick={() => handleRetryPayment(item)}
                                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Retry Payment
                                </button>
                                <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-sm transition-all duration-300">
                                  Contact Support
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Glare effect */}
                          <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative py-16 px-6 border-t border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-white/50 text-sm">
              © 2025 NeonStore. All transactions are secure and encrypted.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

// Export helper functions for use in Payment.jsx
export { saveTransaction }
