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
      "polygon-light",
      "polygon-dark",
      "arbitrum-light",
      "arbitrum-dark",
      "optimism-light",
      "optimism-dark",
      "base-light",
      "base-dark",
      "sonic-light",
      "sonic-dark",
    ], // or any theme you want
  },
};