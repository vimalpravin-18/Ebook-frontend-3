/** @type {import('tailwindcss').Config} */


export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}



module.exports = {
  theme: {
    extend: {
      animation: {
        bounce: 'bounce 1.5s infinite',
        'animate-blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
    },
  },
}




/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        zoomIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        zoomIn: 'zoomIn 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        zoomIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1.2)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'rotate(0deg)', opacity: '1' },
        },
      },
      animation: {
        zoomIn: 'zoomIn 1s ease-out forwards',
        zoomOut: 'zoomOut 1s ease-out forwards',
        slideUp: 'slideUp 1s ease-out forwards',
        slideDown: 'slideDown 1s ease-out forwards',
        rotateIn: 'rotateIn 1s ease-out forwards',
      },
    },
  },
  plugins: [],
}
