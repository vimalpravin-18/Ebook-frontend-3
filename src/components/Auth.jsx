import { useState, useEffect, useRef } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'

/* ========== ANIMATED COMPONENTS ========== */

function FloatingParticles() {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
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

export default function Auth() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      if (!isLogin && password !== confirmPassword) {
        setErrorMessage('Passwords do not match!')
        setLoading(false)
        return
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        if (name.trim() !== '') {
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          })
        }
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-380 bg-[#0a0a0f] flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingParticles />
        
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-25"
          style={{
            background: isLogin 
              ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'
              : 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            left: `${15 + mousePos.x * 0.01}%`,
            top: `${10 + mousePos.y * 0.01}%`,
            transition: 'all 0.5s ease-out'
          }}
        />
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-[90px] opacity-20"
          style={{
            background: isLogin
              ? 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)'
              : 'radial-gradient(circle, #34d399 0%, transparent 70%)',
            right: `${20 + mousePos.x * 0.008}%`,
            bottom: `${15 + mousePos.y * 0.008}%`,
            transition: 'all 0.5s ease-out'
          }}
        />
      </div>

      {/* Main Auth Card - Centered */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
          
          {/* Floating Icon */}
          <div
            className={`absolute top-27 right-5 w-13 h-12 rounded-xl flex items-center justify-center text-3xl transition-all duration-500 ${
              isLogin 
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/30' 
                : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/30'
            } backdrop-blur-xl shadow-2xl animate-bounce`}
            aria-hidden="true"
          >
            {isLogin ? '🔑' : '👤'}
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
              <span className={`block bg-gradient-to-r ${
                isLogin 
                  ? 'from-blue-400 via-purple-400 to-blue-400' 
                  : 'from-green-400 via-emerald-400 to-green-400'
              } bg-clip-text text-transparent`}>
                {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
              </span>
            </h1>
            <p className="text-white/70 text-sm">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Name Field (Signup only) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-left duration-300">
                <label className="block text-white/90 text-xs font-bold mb-2 flex items-center gap-2" htmlFor="name">
                  <span className="text-base">👤</span>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all duration-300"
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-white/90 text-xs font-bold mb-2 flex items-center gap-2" htmlFor="email">
                <span className="text-base">📧</span>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white/90 text-xs font-bold mb-2 flex items-center gap-2" htmlFor="password">
                <span className="text-base">🔒</span>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {/* Confirm Password Field (Signup Only) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-right duration-300">
                <label className="block text-white/90 text-xs font-bold mb-2 flex items-center gap-2" htmlFor="confirmPassword">
                  <span className="text-base">✅</span>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all duration-300"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <p className="text-red-400 text-xs font-semibold flex-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full py-3.5 rounded-xl font-bold text-white text-sm overflow-hidden transition-all duration-300 ${
                loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl'
              } ${
                isLogin
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm">Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">{isLogin ? '🔑' : '🚀'}</span>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}

              {/* Shine effect */}
              {!loading && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setName('')
                setConfirmPassword('')
                setErrorMessage('')
              }}
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? 'text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20'
                  : 'text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20'
              } border border-white/10 hover:border-white/20`}
            >
              {isLogin ? "Create new account" : 'Sign in instead'}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-5 flex items-center justify-center gap-4 text-white/50 text-xs">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>No Spam</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free</span>
            </div>
          </div>

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/10 rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/10 rounded-br-3xl" />
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-white/70 font-semibold">
              © {new Date().getFullYear()} E‑Bookkiee Store
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-4 text-white/50">
              <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Refunds
              </a>
              <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
