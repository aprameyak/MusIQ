import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F8FC',
        card: '#FFFFFF',
        secondaryBg: '#EAF1F8',
        primary: '#35516D',
        secondary: '#7A93AC',
        accent: '#35516D',
        accentLight: '#D0DEEC',
        textPrimary: '#0F2A44',
        textSecondary: '#7A93AC',
        border: '#D6E0EB',
        borderLight: '#D0DEEC',
      },
    },
  },
  plugins: [],
}
export default config

