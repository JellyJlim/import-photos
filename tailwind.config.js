/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{html,js}"],
  theme: {
    extend: {
      listStyleImage: {
        rightarrow: `url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20fill=%22none%22%20viewBox=%220%200%2024%2024%22%20stroke-width=%221.5%22%20stroke=%22currentColor%22%20class=%22size-6%22%3E%3Cpath%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20d=%22M13.5%204.5%2021%2012m0%200-7.5%207.5M21%2012H3%22%20/%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [],
}

