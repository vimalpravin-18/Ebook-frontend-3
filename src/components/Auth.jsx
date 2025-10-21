import { useState, useEffect, useRef } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../firebase'

/* ========== ANIMATED BACKGROUND WITH FLYING BOOKS ========== */

function FlyingBooks() {
  const containerRef = useRef(null)
  const [books, setBooks] = useState([])

  useEffect(() => {
    const bookSymbols = ['📚', '📖', '📕', '📗', '📘', '📙', '📔', '📓', '📒', '✨', '⭐', '💫', '🌟', '🎯', '🚀', '💡', '🔥', '✏️', '📝', '🎨']
    
    const generateBooks = () => {
      return Array.from({ length: 25 }, (_, i) => ({
        id: i,
        symbol: bookSymbols[Math.floor(Math.random() * bookSymbols.length)],
        size: Math.random() * 30 + 20,
        left: Math.random() * 100,
        animationDuration: Math.random() * 20 + 15,
        delay: Math.random() * -20,
        opacity: Math.random() * 0.4 + 0.1,
        rotation: Math.random() * 360
      }))
    }

    setBooks(generateBooks())
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none">
      {books.map((book) => (
        <div
          key={book.id}
          className="absolute animate-float-up"
          style={{
            left: `${book.left}%`,
            fontSize: `${book.size}px`,
            animationDuration: `${book.animationDuration}s`,
            animationDelay: `${book.delay}s`,
            opacity: book.opacity,
            bottom: '-100px',
            transform: `rotate(${book.rotation}deg)`
          }}
        >
          {book.symbol}
        </div>
      ))}
    </div>
  )
}

function AnimatedBackground({ isLogin }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[120px] animate-blob"
          style={{
            width: `${350 + i * 60}px`,
            height: `${350 + i * 60}px`,
            background: isLogin
              ? `radial-gradient(circle, hsl(${220 + i * 20}, 85%, 65%) 0%, transparent 70%)`
              : `radial-gradient(circle, hsl(${140 + i * 20}, 75%, 55%) 0%, transparent 70%)`,
            left: `${15 + i * 20}%`,
            top: `${10 + i * 25}%`,
            opacity: 0.12,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${12 + i * 3}s`
          }}
        />
      ))}
    </div>
  )
}

export default function Auth() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Focus states for floating labels
  const [nameFocused, setNameFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (!isLogin && password !== confirmPassword) {
        setErrorMessage('Passwords do not match!')
        setLoading(false)
        return
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
        setSuccessMessage('Welcome back! Signing you in...')
      } else {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        // Update display name if provided
        if (name.trim() !== '') {
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          })
        }

        // Show success message - user is automatically signed in by Firebase
        setSuccessMessage(`Welcome ${name.trim() || 'aboard'}! Your account has been created successfully. Signing you in...`)
      }

      // The user is now automatically signed in by Firebase
      // The parent component's onAuthStateChanged listener will handle navigation
      
    } catch (error) {
      console.error('Auth error:', error)
      
      // User-friendly error messages
      let message = ''
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Please sign in instead.'
          break
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters long.'
          break
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.'
          break
        case 'auth/user-not-found':
          message = 'No account found with this email. Please sign up first.'
          break
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.'
          break
        default:
          message = error.message || 'An error occurred. Please try again.'
      }
      
      setErrorMessage(message)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      setSuccessMessage('Signed in successfully! Redirecting...')
    } catch (error) {
      console.error('Google sign-in error:', error)
      
      let message = ''
      switch (error.code) {
        case 'auth/operation-not-allowed':
          message = 'Google sign-in is not enabled. Please contact support.'
          break
        case 'auth/unauthorized-domain':
          message = 'This domain is not authorized for Google sign-in.'
          break
        case 'auth/popup-blocked':
          message = 'Popup was blocked. Please allow popups and try again.'
          break
        case 'auth/popup-closed-by-user':
          message = 'Sign-in cancelled.'
          break
        default:
          message = error.message || 'Failed to sign in with Google'
      }
      
      setErrorMessage(message)
      setGoogleLoading(false)
    }
  }

  const handleToggleAuthMode = () => {
    setIsTransitioning(true)
    
    setTimeout(() => {
      setIsLogin(!isLogin)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setErrorMessage('')
      setSuccessMessage('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setNameFocused(false)
      setEmailFocused(false)
      setPasswordFocused(false)
      setConfirmPasswordFocused(false)
      setIsTransitioning(false)
    }, 400)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden">
      
      <AnimatedBackground isLogin={isLogin} />
      <FlyingBooks />

      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex flex-col">
          
          <div className="flex-grow flex items-center justify-center p-4 py-8">
            
            <div 
              className={`relative z-10 w-full max-w-md transition-all duration-700 ${
                isTransitioning 
                  ? 'opacity-0 scale-95 rotate-2' 
                  : 'opacity-100 scale-100 rotate-0'
              }`}
            >
              {/* Enhanced Glow effect */}
              <div 
                className={`absolute -inset-3 rounded-3xl blur-2xl transition-all duration-700 animate-pulse-slow ${
                  isLogin 
                    ? 'bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30' 
                    : 'bg-gradient-to-r from-green-600/30 via-emerald-600/30 to-teal-600/30'
                }`}
              />

              <div className="relative rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 shadow-[0_25px_100px_rgba(0,0,0,0.7)] overflow-hidden">
                
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-3xl opacity-50">
                  <div 
                    className={`absolute inset-0   rounded-3xl animate-border-flow ${
                      isLogin 
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
                    }`}
                    style={{ padding: '2px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }}
                  />
                </div>

                <div className="relative p-8 sm:p-10">
                  
                  {/* Header */}
                  <div className="text-center  mb-8">
                    <h1 
                      className={`text-4xl sm:text-5xl font-black mb-2 leading-tight transition-all duration-500 ${
                        isTransitioning ? 'opacity-0 -translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
                      }`}
                    >
                      <span className={`block animate-gradient bg-clip-text text-transparent bg-[length:200%_auto] ${
                        isLogin 
                          ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' 
                          : 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400'
                      }`}>
                        {isLogin ? 'Welcome Back' : 'Join Us'}
                      </span>
                    </h1>
                    <p className={`text-white/60 text-sm transition-all duration-500 ${
                      isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}>
                      {isLogin ? 'Continue your journey' : 'Start your adventure'}
                    </p>
                  </div>

                  {/* Google Sign In Button */}
                

                  {/* Divider */}
                  

                  {/* Form with Floating Labels */}
                  <form onSubmit={handleAuth} className="space-y-5">
                    
                    {/* Name Field with Floating Label */}
                    {!isLogin && (
                      <div className={`relative transition-all duration-500 ${isTransitioning ? 'opacity-0 -translate-x-6' : 'opacity-100 translate-x-0'}`}>
                        <div className="relative">
                          <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setNameFocused(true)}
                            onBlur={() => setNameFocused(false)}
                            className={`peer w-full px-4 pt-6 pb-2 text-sm rounded-xl bg-white/5 backdrop-blur-2xl border-2 text-white placeholder-transparent focus:outline-none transition-all duration-300 ${
                              nameFocused || name
                                ? 'border-green-500/50 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                            placeholder="Full Name"
                            required={!isLogin}
                          />
                          <label
                            htmlFor="name"
                            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                              nameFocused || name
                                ? 'top-2 text-[10px] text-green-400 font-bold'
                                : 'top-4 text-sm text-white/50'
                            }`}
                          >
                            👤 Full Name
                          </label>
                          <div className={`absolute inset-0 rounded-xl blur-xl transition-opacity duration-300 ${
                            nameFocused ? 'opacity-100 bg-green-500/10' : 'opacity-0'
                          }`} style={{ zIndex: -1 }} />
                        </div>
                      </div>
                    )}

                    {/* Email Field with Floating Label */}
                    <div className={`relative transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => setEmailFocused(false)}
                          className={`peer w-full px-4 pt-6 pb-2 text-sm rounded-xl bg-white/5 backdrop-blur-2xl border-2 text-white placeholder-transparent focus:outline-none transition-all duration-300 ${
                            emailFocused || email
                              ? `${isLogin ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-green-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'} bg-white/10`
                              : 'border-white/10 hover:border-white/20'
                          }`}
                          placeholder="Email Address"
                          required
                        />
                        <label
                          htmlFor="email"
                          className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                            emailFocused || email
                              ? `top-2 text-[10px] ${isLogin ? 'text-blue-400' : 'text-green-400'} font-bold`
                              : 'top-4 text-sm text-white/50'
                          }`}
                        >
                          📧 Email Address
                        </label>
                        <div className={`absolute inset-0 rounded-xl blur-xl transition-opacity duration-300 ${
                          emailFocused ? `opacity-100 ${isLogin ? 'bg-blue-500/10' : 'bg-green-500/10'}` : 'opacity-0'
                        }`} style={{ zIndex: -1 }} />
                      </div>
                    </div>

                    {/* Password Field with Floating Label */}
                    <div className={`relative transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          className={`peer w-full px-4 pt-6 pb-2 pr-12 text-sm rounded-xl bg-white/5 backdrop-blur-2xl border-2 text-white placeholder-transparent focus:outline-none transition-all duration-300 ${
                            passwordFocused || password
                              ? `${isLogin ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-green-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'} bg-white/10`
                              : 'border-white/10 hover:border-white/20'
                          }`}
                          placeholder="Password"
                          required
                        />
                        <label
                          htmlFor="password"
                          className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                            passwordFocused || password
                              ? `top-2 text-[10px] ${isLogin ? 'text-blue-400' : 'text-green-400'} font-bold`
                              : 'top-4 text-sm text-white/50'
                          }`}
                        >
                          🔒 Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all duration-300 group"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                        <div className={`absolute inset-0 rounded-xl blur-xl transition-opacity duration-300 ${
                          passwordFocused ? `opacity-100 ${isLogin ? 'bg-blue-500/10' : 'bg-green-500/10'}` : 'opacity-0'
                        }`} style={{ zIndex: -1 }} />
                      </div>
                    </div>

                    {/* Confirm Password Field with Floating Label */}
                    {!isLogin && (
                      <div className={`relative transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-6' : 'opacity-100 translate-x-0'}`}>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setConfirmPasswordFocused(true)}
                            onBlur={() => setConfirmPasswordFocused(false)}
                            className={`peer w-full px-4 pt-6 pb-2 pr-12 text-sm rounded-xl bg-white/5 backdrop-blur-2xl border-2 text-white placeholder-transparent focus:outline-none transition-all duration-300 ${
                              confirmPasswordFocused || confirmPassword
                                ? 'border-green-500/50 bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                            placeholder="Confirm Password"
                            required
                          />
                          <label
                            htmlFor="confirmPassword"
                            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                              confirmPasswordFocused || confirmPassword
                                ? 'top-2 text-[10px] text-green-400 font-bold'
                                : 'top-4 text-sm text-white/50'
                            }`}
                          >
                            ✅ Confirm Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all duration-300 group"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            )}
                          </button>
                          <div className={`absolute inset-0 rounded-xl blur-xl transition-opacity duration-300 ${
                            confirmPasswordFocused ? 'opacity-100 bg-green-500/10' : 'opacity-0'
                          }`} style={{ zIndex: -1 }} />
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <div className="p-3 rounded-xl bg-green-500/10 border-2 border-green-500/30 backdrop-blur-xl animate-slide-in">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✅</span>
                          <p className="text-green-400 text-xs font-semibold flex-1">
                            {successMessage}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-red-500/10 border-2 border-red-500/30 backdrop-blur-xl animate-shake">
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
                      disabled={loading || googleLoading}
                      className={`group relative w-full py-4 rounded-xl font-bold text-white text-sm overflow-hidden transition-all duration-500 transform ${
                        loading ? 'opacity-60 cursor-not-allowed scale-95' : 'hover:scale-[1.02] active:scale-[0.98]'
                      } ${
                        isLogin
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.6)]'
                          : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.6)]'
                      } ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="text-lg">{isLogin ? '🚀' : '✨'}</span>
                          <span className="tracking-wide">{isLogin ? 'Sign In' : 'Create Account'}</span>
                        </span>
                      )}

                      {!loading && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                      )}
                    </button>
                  </form>

                  {/* Toggle Mode */}
                  <div className={`mt-6 text-center transition-all duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <button
                      type="button"
                      onClick={handleToggleAuthMode}
                      className={`group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                        isLogin
                          ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20 border-2 border-green-500/30 hover:border-green-500/50'
                          : 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500/30 hover:border-blue-500/50'
                      }`}
                    >
                      <span className="text-base">{isLogin ? '✨' : '🔐'}</span>
                      <span>{isLogin ? "Create new account" : 'Already have account?'}</span>
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className={`mt-6 flex items-center justify-center gap-3 text-white/60 text-xs transition-all duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    {[
                      { icon: '🔒', text: 'Secure' },
                      { icon: '🚀', text: 'Fast' },
                      { icon: '✨', text: 'Free' }
                    ].map((badge, i) => (
                      <div 
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <span className="text-sm">{badge.icon}</span>
                        <span className="font-bold">{badge.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="relative z-10 border-t-2 border-white/10 bg-black/40 backdrop-blur-2xl flex-shrink-0">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <p className="text-white/70 font-bold">
                  © {new Date().getFullYear()} Bookly
                </p>
                <nav className="flex flex-wrap items-center justify-center gap-4 text-white/50">
                  <a 
                    href="\public\terms-and-conditions.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white transition-colors duration-300 flex items-center gap-1 font-semibold"
                  >
                    <span className="text-sm">📄</span>
                    Terms & Conditions
                  </a>
                  <a 
                    href="\public\Privacy-policy.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white transition-colors duration-300 flex items-center gap-1 font-semibold"
                  >
                    <span className="text-sm">🪩</span>
                    Privacy
                  </a>

                  <a 
                    href="\public\Shipping-policy.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white transition-colors duration-300 flex items-center gap-1 font-semibold"
                  >
                    <span className="text-sm">🔒</span>
                    Shipping
                  </a>
                  <a 
                    href="\public\Refund-Policy.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white transition-colors duration-300 flex items-center gap-1 font-semibold"
                  >
                    <span className="text-sm">💰</span>
                    Refund
                  </a>
                  <a 
                    href="\public\Contact-Us.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white transition-colors duration-300 flex items-center gap-1 font-semibold"
                  >
                    <span className="text-sm">📞</span>
                    Contact Us
                  </a>
                </nav>
              </div>
            </div>
          </footer>

        </div>
      </div>

      {/* Enhanced Custom Animations */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(calc(100vh + 100px)) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100px) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 20px) scale(1.02); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes slide-in {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        @keyframes border-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-float-up {
          animation: float-up linear infinite;
        }

        .animate-blob {
          animation: blob ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-border-flow {
          animation: border-flow 3s linear infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  )
}
