module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  important: true,
  // darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        zz: {
          50: "#22F7E1",
          100: "#06C8EB",
          150: "#09A7F6"
        },
        metamask: {
          50: "#F6851B",
          100: "#B96319",
          150: "#773E16"
        },
        coinbase: {
          50: "#2860F3",
          100: "#1D46B2",
          150: "#112C71"
        },
        walletConnect: {
          50: "#2A84FC",
          100: "#1A61BE",
          150: "#093C80"
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717"
        }
      },
      gradientColorStops: theme => ({
        ...theme('colors')
      }),
      screens: {
        // target elements that actually have hover functionality
        'hover-hover': {'raw': '(hover: hover)'}
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['disabled'],
      textColor: ['disabled'],
      opacity: ['disabled'],
      backgroundImage: ['disabled'],
      cursor: ['disabled']
    },
  },
  plugins: [],
}

