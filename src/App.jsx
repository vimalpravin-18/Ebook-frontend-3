import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Auth from './components/Auth'
import Payment from './components/Payment'
import Sidebar from './components/Sidebar'
import HomeDashboard from './components/HomeDashboard'
import Favorites from './components/Favorites'
import SiteFooter from './components/SiteFooter'

// Optional: tiny hook to read favorites count from localStorage
function useFavCount(key = 'fav_books') {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(key) || '[]'
        const arr = JSON.parse(raw)
        setCount(Array.isArray(arr) ? arr.length : 0)
      } catch {
        setCount(0)
      }
    }
    read()
    // Listen for cross-tab changes
    const onStorage = (e) => { if (e.key === key) read() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])
  return count
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')

  // Keep Favorites count visible in header
  const favCount = useFavCount()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar with page setter */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex-grow ml-20 p-6 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm mb-6">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1
              onClick={() => setActivePage('home')}
              className="text-3xl font-bold text-gray-800 select-none cursor-pointer"
              title="Go to Home"
            >
              E - Bookkiee Store
            </h1>

           

              <span className="text-gray-600 ml-130 select-text">
                Welcome, {user.email}
              </span>
              <button
                onClick={() => signOut(auth)}
                className="bg-red-500 text-white px-0 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          
        </header>

        {/* Pages (no react-router needed for this layout) */}
        {activePage === 'home' && (
          <HomeDashboard onExploreLibrary={() => setActivePage('library')} />
        )}

        {activePage === 'library' && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Library</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('favorites')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                >
                  View Favorites {favCount > 0}
                </button>
              </div>
            </div>
            <Payment user={user} />
          </section>
        )}

        {activePage === 'favorites' && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Favorites</h2>
              <button
                onClick={() => setActivePage('library')}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
              >
                ← Back to Library
              </button>
            </div>
            {/* Mount the Favorites page directly (remove <Route/> usage) */}
            <Favorites />
          </section>
        )}

        {activePage === 'profile' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <p>User profile page coming soon.</p>
          </section>
        )}


        {activePage === 'settings' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p>Adjust preferences here.</p>
          </section>
        )}

        <SiteFooter />
      </div>
    </div>
    
  )
}

export default App
