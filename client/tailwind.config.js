/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    fontFamily: {
      heading: ['Merriweather', 'serif'],
      body: ['Quicksand', 'sans-serif'],
    },
  },
};
export const plugins = [];
