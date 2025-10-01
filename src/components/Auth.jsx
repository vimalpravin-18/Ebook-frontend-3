import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import SiteFooter from './SiteFooter'

export default function Auth() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

        // Update the user profile with name
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
    <div className="h-700 w-screen max-h-[770px] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-2">
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-120 w-full text-gray-800 absolute overflow-hidden">
        {/* Floating Icon */}
        <div
          className={`absolute top-2 right-0 w-18 h-18 rounded-full flex items-center justify-center text-6xl transition-colors duration-500 ${
            isLogin ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          } animate-bounce`}
          aria-hidden="true"
        >
          {isLogin ? '🔑' : '👤'}
        </div>

        {/* Header */}
        <h1 className="text-4xl font-extrabold mb-0 text-center select-none">   
          {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
        </h1>
        <p className="text-center text-gray-500 mb-3 select-none">
          {isLogin ? 'Sign in to access your e-book collection' : 'Create your account to get started'}
        </p>

        {/* Name Field (Signup only) */}
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              required={!isLogin}
              autoComplete="name"
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6 relative z-10">
          {/* Email Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              required
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder={isLogin ? 'Enter your password' : 'Create a password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {/* Confirm Password Field (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="block text-gray-700 font-medium mb-0" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-300 transition"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-500 text-sm font-medium text-center animate-pulse select-text">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-transform duration-300 ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
            } ${
              isLogin
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl shadow-blue-400'
                : 'bg-gradient-to-r from-green-600 to-green-800 shadow-xl shadow-green-400'
            }`}
          >

            

            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-6 w-6 text-white"
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
                <span>Processing...</span>
              </span>
            ) : isLogin ? (
              '🔑 Sign In to E-book Store'
            ) : (
              '🚀 Create Account'
            )}
          </button>
        </form>


        {/* Toggle Auth Mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setName('')
              setConfirmPassword('')
              setErrorMessage('')
            }}
            className="text-blue-600 font-semibold hover:underline focus:outline-none"
          >
            {isLogin ? "Don't have an account? Create one free →" : 'Already have an account? Sign in →'}
          </button>
        </div>
      </div>
       <footer className="mt-16 border-t border-white/10 bg-white text-white">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="ml-230 font-extrabold text-black">© {new Date().getFullYear()} E‑Bookkiee Store</p>
        <nav className="flex flex-wrap items-center gap-6 text-white/80">
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Terms & Policies</a>
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Privacy</a>
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Refunds</a>
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Delivery</a>
          <a href="src/components/Razor pay terms and conditions.pdf" target="_blank" rel="noreferrer" className="hover:text-white">Contact</a>
        </nav>
      </div>
    </footer>
    </div>
  )
}
