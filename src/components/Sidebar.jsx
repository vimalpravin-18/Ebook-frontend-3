import { useState, useEffect } from 'react'

const navItems = [
  { label: 'Home', icon: '🏠', gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/50' },
  { label: 'Library', icon: '📚', gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/50' },
  { label: 'Favorites', icon: '⭐', gradient: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/50' },
  { label: 'Contact', icon: '📧', gradient: 'from-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/50' },
  { label: 'Profile', icon: '👤', gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/50' }
]

export default function CircularSidebar({ activePage, setActivePage }) {
  const [hovering, setHovering] = useState(false)
  const [clickedIndex, setClickedIndex] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const radius = 120

  useEffect(() => {
    if (clickedIndex !== null) {
      const timer = setTimeout(() => setClickedIndex(null), 600)
      return () => clearTimeout(timer)
    }
  }, [clickedIndex])

  const handleClick = (item, index) => {
    setClickedIndex(index)
    setActivePage(item.label.toLowerCase())
    
    // Haptic-like visual feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  return (
    <div 
      className="fixed bottom-110 left-40 z-50"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false)
        setHoveredIndex(null)
      }}
    >
      <div className="relative flex items-center justify-center">
        
        {/* Center Button with Advanced Effects */}
        <div className="relative">
          {/* Outer rotating ring */}
          {hovering && (
            <div className="absolute inset-0 -m-10 rounded-full border-2 border-dashed border-purple-400/30 animate-spin" style={{ animationDuration: '10s' }} />
          )}
          
          {/* Pulsing background */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 transition-all duration-300 ${
            hovering ? 'scale-150 opacity-20 blur-2xl' : 'scale-110 opacity-40 blur-xl'
          }`} />
          
          {/* Main button */}
          <button
            className={`relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-900 overflow-hidden ${
              hovering 
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-[0_0_60px_rgba(168,85,247,1)] scale-110 rotate-360' 
                : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105'
            }`}
          >
            {/* Animated gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-9000 ${
              hovering ? 'translate-x-full' : '-translate-x-full'
            }`} />
            
            {/* Icon */}
            <span className={`relative z-10 text-2xl font-bold transition-all duration-500 ${
              hovering ? 'rotate-360 scale-125' : 'rotate-0'
            }`}>
              {hovering ? '✕' : '☰'}
            </span>
            
            {/* Ping effect when not hovering */}
            {!hovering && (
              <>
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-ping opacity-30" />
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse opacity-40" />
              </>
            )}
          </button>
        </div>

        {/* Radial Menu Items with Enhanced Effects */}
        {navItems.map((item, i) => {
          const angle = (i / navItems.length) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const isActive = activePage === item.label.toLowerCase()
          const isHovered = hoveredIndex === i
          const isClicked = clickedIndex === i

          return (
            <div
              key={item.label}
              className="absolute"
              style={{
                transform: hovering 
                  ? `translate(-50%, -50%) translateX(${x}px) translateY(${y}px)` 
                  : `translate(-50%, -50%) translateX(0px) translateY(0px)`,
                opacity: hovering ? 1 : 0,
                left: '50%',
                top: '50%',
                transition: `all ${0.6 + i * 0.1}s cubic-bezier(0.34, 1.56, 4.64, 1)`,
                zIndex: hovering ? 30 : -1,
              }}
            >
              {/* Connection line */}
              {hovering && isHovered && (
                <div 
                  className="absolute top-1/2 left-1/2 w-px bg-gradient-to-t from-white/50 to-transparent animate-pulse"
                  style={{
                    height: `${radius}px`,
                    transform: `rotate(${angle + Math.PI / 2}rad) translateX(-50%)`,
                    transformOrigin: 'top',
                  }}
                />
              )}

              {/* Glow ring */}
              {(isActive || isHovered) && (
                <div className={`absolute inset-0 -m-2 rounded-full bg-gradient-to-br ${item.gradient} opacity-40 blur-xl animate-pulse`} />
              )}

              {/* Button */}
              <button
                onClick={() => handleClick(item, i)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                title={item.label}
                className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 overflow-hidden ${
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} border-white ${item.shadow} shadow-2xl scale-110` 
                    : isHovered
                    ? `bg-gradient-to-br ${item.gradient} border-white/80 ${item.shadow} shadow-xl scale-125`
                    : 'bg-black/70 backdrop-blur-xl border-white/30 shadow-lg'
                } ${
                  isClicked ? 'scale-90' : ''
                }`}
              >
                {/* Ripple click effect */}
                {isClicked && (
                  <>
                    <span className={`absolute inset-0 rounded-full bg-white animate-ping opacity-75`} />
                    <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.gradient} animate-pulse`} />
                  </>
                )}

                {/* Rotating border on hover */}
                {isHovered && (
                  <span 
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${item.gradient} opacity-50 blur-sm animate-spin`}
                    style={{ animationDuration: '2s' }}
                  />
                )}

                {/* Icon */}
                <span className={`relative z-10 text-3xl transition-all duration-300 ${
                  isActive || isHovered ? 'scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''
                } ${
                  isClicked ? 'scale-150 rotate-12' : ''
                }`}>
                  {item.icon}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white shadow-lg" />
                  </span>
                )}

                {/* Hover shine effect */}
                {isHovered && (
                  <div className="absolute inset-0 rounded-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" 
                      style={{
                        animation: 'shimmer 1.5s infinite',
                        backgroundSize: '200% 100%'
                      }}
                    />
                  </div>
                )}

                {/* Inner glow */}
                {(isActive || isHovered) && (
                  <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${item.gradient} opacity-20 blur-md`} />
                )}
              </button>

              {/* Label on hover */}
              {isHovered && (
                <div 
                  className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{
                    left: x > 0 ? 'calc(100% + 16px)' : 'auto',
                    right: x < 0 ? 'calc(100% + 16px)' : 'auto',
                  }}
                >
                  <div className={`px-4 py-2 rounded-xl bg-gradient-to-br ${item.gradient} backdrop-blur-xl border border-white/20 shadow-2xl`}>
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      {item.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Orbital particles */}
              {isHovered && (
                <>
                  <span 
                    className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-orbit"
                    style={{ animationDuration: '1.5s', animationDelay: '0s' }}
                  />
                  <span 
                    className="absolute w-1 h-1 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-orbit"
                    style={{ animationDuration: '2s', animationDelay: '0.5s' }}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes orbit {
          0% { 
            transform: rotate(0deg) translateX(32px) rotate(0deg);
            opacity: 0;
          }
          50% { 
            opacity: 1;
          }
          100% { 
            transform: rotate(360deg) translateX(32px) rotate(-360deg);
            opacity: 0;
          }
        }
        
        .animate-orbit {
          animation: orbit 2s infinite;
        }
      `}</style>
    </div>
  )
}
