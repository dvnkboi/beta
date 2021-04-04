module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    display:{
      'wBox': '-webkit-box'
    },
    filter: { // defaults to {}
      'none': 'none',
      'grayscale': 'grayscale(1)',
      'invert': 'invert(1)',
      'sepia': 'sepia(1)',
    },
    backdropFilter: { // defaults to {}
      'none': 'none',
      'blur': 'blur(20px)',
    },
    fontFamily: {
      sans: [
        'Atkinson',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
      ],
      serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
    fontSize: {
      'xxs': '.675rem',
      'xs': '.75rem',
      'sm': '.875rem',
      'tiny': '.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
      '8xl': '6rem',
      '9xl': '7rem',
      '10xl': '8rem',
      '11xl': '10rem',
      '12xl': '12rem',
    },
    screens: {
      'xxs': '367px',
      'xs': '420px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    aspectRatio: { // defaults to {}
      'none': 0,
      'square': [1, 1], // or 1 / 1, or simply 1
      '16/9': [16, 9],  // or 16 / 9
      '4/3': [4, 3],    // or 4 / 3
      '21/9': [21, 9],  // or 21 / 9
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 30px 70px -20px rgba(0, 0, 0, 0.35)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
    },
    borderRadius: {
      none: '0px',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '1rem',
      '2xl': '1.5rem',
      '3xl': '1.75rem',
      '4xl': '2rem',
      full: '9999px',
    },
    extend: {
      transitionProperty: {
        'height': 'height',
        'width': 'width'
       },
      borderWidth:{
        '1':'2px',
      },
      scale:{
        '25':'.25',
        '35':'.35'
      },
      transitionDuration: {
        15:'15ms',
        25:'25ms',
        50:'50ms',
        2000: '2000ms'
      },
      height: {
        '100': '365px',
        '120': '450px'
      },
      width: {
        '100': '365px',
        '120': '450px'
      },
      colors: {
        black: {
          dark: '#0E0E0E',
          DEFAULT: '#232323',
          light: '#303030',
        },
        pink: {
          500: "#D81159",
          DEFAULT: "#D81159",
        },
        green: {
          500: "#50CE8D",
          DEFAULT: "#50CE8D",
        },
        purple: {
          500: "#8F00DF",
          DEFAULT: "#8F00DF",
        },
        cyan: {
          500: "#27A4FD",
          DEFAULT: "#27A4FD",
        },
        blue: {
          500: "#422AD5",
          DEFAULT: "#422AD5",
        },
        deep: {
          
          DEFAULT:"#1A182B",
        }
      }
    },
  },
  variants: {
    filter: ['responsive'], // defaults to ['responsive']
    backdropFilter: ['responsive'], // defaults to ['responsive']
    aspectRatio: ['responsive'], // defaults to ['responsive']
    extend: {
      pointerEvents: ['hover', 'focus', 'group-hover','group-focus','focus-within'],
      scale: ['group-hover'],
      padding: ['hover'],
      ringWidth:['hover','group-hover'],
      translate:['group-hover'],
      borderRadius: ['hover', 'group-hover'],
    },
  },
  plugins: [
    require('tailwindcss-filters'),
    require('tailwindcss-aspect-ratio'),
  ],
}
