/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './CHENN-AI/**/*.{js,ts,jsx,tsx,html}',
    './CHENN-AI/*.{js,ts,jsx,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        maroon: '#4B1E1E', // temple tile
        turmeric: '#E1AD01', // turmeric amber
        indigo: '#26418f', // Marina indigo
        leaf: '#2f7a4a', // banana-leaf green
        coffee: '#6B3F2B', // filter-coffee brown
        kolam: '#FFFDF0', // kolam white / ivory
        paper: '#FFF8EF'
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', 'Poppins', 'sans-serif']
      },
      boxShadow: {
        'chennai-sm': '0 2px 6px rgba(38,65,143,0.06)',
        'chennai-md': '0 8px 20px rgba(38,65,143,0.08)',
        'chennai-lg': '0 18px 40px rgba(38,65,143,0.10)',
        'chennai-soft': '0 6px 18px rgba(6,24,86,0.08)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      },
      extend: {
        spacing: {
          '72': '18rem'
        }
      }
    }
  },
  plugins: [],
};
