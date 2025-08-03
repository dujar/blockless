export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
    "./src/styles/**/*.css",
  ],
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      "light",
      "dark",
      "ethereum-light",
      "ethereum-dark",
      "avalanche-light",
      "avalanche-dark",
      "optimism-light",
      "optimism-dark",
      "base-light",
      "base-dark",
      "polygon-light",
      "polygon-dark",
      "bnb-light",
      "bnb-dark",
      "gnosis-light",
      "gnosis-dark",
      "linea-light",
      "linea-dark",
      "zksync-light",
      "zksync-dark",
      "arbitrum-light",
      "arbitrum-dark",
      {
        "dark-orange": {
          "primary": "#F97316",
          "secondary": "#F97316",
          "accent": "#F97316",
          "neutral": "#4B5563",
          "base-100": "#261A10",
          "base-200": "#362A20",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      "swoop",
    ],
    darkTheme: "dark-orange", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color variables
  },
};