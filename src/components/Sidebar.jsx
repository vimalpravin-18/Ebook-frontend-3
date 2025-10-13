import { useState } from 'react'

const navItems = [
  { label: 'Home', icon: '🏠', gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/50' },
  { label: 'Library', icon: '📚', gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/50' },
  { label: 'Favorites', icon: '⭐', gradient: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/50' },
  { label: 'Contact', icon: '📧', gradient: 'from-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/50' },
  { label: 'Profile', icon: '👤', gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/50' }
]

export default function EdgeHoverSidebar({ activePage, setActivePage }) {
  const [open, setOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <div style={{ zIndex: 200 }}>

      {/* Minimal hover trigger strip */}
      <div
        className={`
          fixed top-0 left-0 w-2 h-full z-50
          transition-all duration-300
          ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        onMouseEnter={() => setOpen(true)}
        tabIndex={0}
      >
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-20 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-orange-500/50 rounded-r-full animate-pulse" />
      </div>

      {/* Sidebar: slides in from left with labels */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-24
          flex flex-col py-6 items-center
          bg-gradient-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-2xl 
          border-r border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]
          z-50
          transition-all duration-400 ease-out
          ${open ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}
        onMouseLeave={() => {
          setOpen(false)
          setHoveredItem(null)
        }}
        tabIndex={0}
      >
        {/* Animated glow bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/60 via-purple-500/60 via-pink-500/60 to-orange-500/60 animate-pulse" />

        {/* Logo/Brand */}
        <div className="mb-8 mt-2">
          <div className="w-18 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">📖</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col justify-center gap-8 w-full px-3">
          {navItems.map((item) => {
            const isActive = activePage === item.label.toLowerCase()
            const isHovered = hoveredItem === item.label

            return (
              <button
                key={item.label}
                onClick={() => {
                  setActivePage(item.label.toLowerCase())
                  setOpen(false)
                }}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  relative flex flex-col items-center justify-center
                  w-full py-3 px-2 rounded-xl
                  transition-all duration-300
                  group
                  ${isActive
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg scale-105`
                    : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                  }
                `}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white animate-pulse" />
                )}

                {/* Icon */}
                <div className={`
                  text-2xl mb-1
                  transition-all duration-300
                  ${isActive || isHovered ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'scale-100'}
                `}>
                  {item.icon}
                </div>

                {/* Label */}
                <span className={`
                  text-[10px] font-bold uppercase tracking-wider
                  transition-all duration-300
                  ${isActive 
                    ? 'text-white drop-shadow-lg' 
                    : 'text-white/70 group-hover:text-white'
                  }
                  ${isActive || isHovered ? 'scale-105' : 'scale-100'}
                `}>
                  {item.label}
                </span>

                {/* Hover glow effect */}
                <div className={`
                  absolute inset-0 rounded-xl
                  bg-gradient-to-r ${item.gradient}
                  opacity-0 group-hover:opacity-20 blur-md
                  transition-opacity duration-300
                  pointer-events-none
                `} />

                {/* Shine animation on hover */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className={`
                    absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                    -translate-x-full group-hover:translate-x-full
                    transition-transform duration-700
                  `} />
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer indicator */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="w-8 h-0.5 rounded-full bg-white/20" />
          <p className="text-[8px] text-white/40 font-semibold">Bookly </p>
        </div>
      </aside>

      {/* Backdrop overlay when sidebar is open */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}
