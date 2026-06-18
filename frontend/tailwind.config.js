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
        background: "#050505", // deep obsidian black
        cardBg: "rgba(10, 15, 10, 0.7)", // green-tinted glass
        neonCyan: "#ccff00", // Toxic Volt (DNA/Biohazard)
        neonGreen: "#ff0055", // Bio-Pulse Crimson (Blood)
        cyberPurple: "#00f5ff", // Digital Ice-Teal
      },
      boxShadow: {
        glowCyan: "0 0 15px rgba(204, 255, 0, 0.5)",
        glowGreen: "0 0 15px rgba(255, 0, 85, 0.5)",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
