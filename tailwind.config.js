/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        pokeblue: "#547b8c",
        pokelight: "#88b6cb",
        pokegreen: "#b3ddca",
        bug: "#92BD2D",
        dark: "#595761",
        dragon: "#0C6AC8",
        electric: "#F2D94E",
        fairy: "#EF90E6",
        fighting: "#D3425F",
        fire: "#FBA64C",
        flying: "#A1BBEC",
        ghost: "#5F6DBC",
        grass: "#60BD58",
        ground: "#DA7C4D",
        ice: "#76D1C1",
        normal: "#A0A29F",
        poison: "#B763CF",
        psychic: "#FA8582",
        rock: "#C9BC8A",
        steel: "#5795A3",
        water: "#539DDF",
      },
      fontFamily: {
        panchang: ["Panchang", "sans-serif"],
      },
    },
  },
  plugins: [],
};
