/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },

        slide: {
          '0%': {
            transform: 'translateX(-150%) skewX(-20deg)',
          },
          '100%': {
            transform: 'translateX(400%) skewX(-20deg)',
          },
        },

        floatSlow: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },

        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        marquee: {
          '0%': {
            transform: 'translateX(0)',
          },

          '100%': {
            transform: 'translateX(-50%)',
          },
        },
      },

      animation: {
        'bounce-subtle': 'bounce 2s infinite',

        shimmer: 'shimmer 6s linear infinite',

        'float-slow': 'floatSlow 4s ease-in-out infinite',

        'slide-in': 'slideIn 0.7s ease-out forwards',

        slide: 'slide 6s linear infinite',

        marquee: 'marquee 4s linear infinite',
      },
    },
  },

  plugins: [],
};