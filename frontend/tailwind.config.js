/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC", // soft slate white
        cardBg: "#FFFFFF", // solid pure white cards
        neonCyan: "#2563EB", // Cobalt blue (Medical primary)
        neonGreen: "#0D9488", // Teal/emerald (Active)
        cyberPurple: "#7C3AED", // Neural purple (Explainability)
        bloodRed: "#E11D48", // Clinical crimson (Disclaimers)
      },
      boxShadow: {
        glowCyan: "0 10px 25px -5px rgba(37, 99, 235, 0.08), 0 8px 10px -6px rgba(37, 99, 235, 0.08)",
        glowGreen: "0 10px 25px -5px rgba(13, 148, 136, 0.08), 0 8px 10px -6px rgba(13, 148, 136, 0.08)",
        glowPurple: "0 10px 25px -5px rgba(124, 58, 237, 0.08), 0 8px 10px -6px rgba(124, 58, 237, 0.08)",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Outfit'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
