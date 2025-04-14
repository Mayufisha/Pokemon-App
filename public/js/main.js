document.addEventListener("DOMContentLoaded", () => {
  const typeIcons = {
    bug: "/images/pokemon-type-icons/bug.svg",
    dark: "/images/pokemon-type-icons/dark.svg",
    dragon: "/images/pokemon-type-icons/dragon.svg",
    electric: "/images/pokemon-type-icons/electric.svg",
    fairy: "/images/pokemon-type-icons/fairy.svg",
    fighting: "/images/pokemon-type-icons/fighting.svg",
    fire: "/images/pokemon-type-icons/fire.svg",
    flying: "/images/pokemon-type-icons/flying.svg",
    ghost: "/images/pokemon-type-icons/ghost.svg",
    grass: "/images/pokemon-type-icons/grass.svg",
    ground: "/images/pokemon-type-icons/ground.svg",
    ice: "/images/pokemon-type-icons/ice.svg",
    normal: "/images/pokemon-type-icons/normal.svg",
    poison: "/images/pokemon-type-icons/poison.svg",
    psychic: "/images/pokemon-type-icons/psychic.svg",
    rock: "/images/pokemon-type-icons/rock.svg",
    steel: "/images/pokemon-type-icons/steel.svg",
    water: "/images/pokemon-type-icons/water.svg",
  };

  const typeColors = {
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
  };

  // Generation ranges
  const generationRanges = {
    1: { start: 1, end: 151 },
    2: { start: 152, end: 251 },
    3: { start: 252, end: 386 },
    4: { start: 387, end: 493 },
    5: { start: 494, end: 649 },
    6: { start: 650, end: 721 },
    7: { start: 722, end: 809 },
    8: { start: 810, end: 905 },
    9: { start: 906, end: 1025 },
  };

  // Current generation and pokemon list
  let currentGeneration = "1";
  let pokemonList = [];
  let allPokemonList = [];

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  function toggleFavorite(pokemonId) {
    if (favorites.includes(pokemonId)) {
      favorites = favorites.filter((id) => id !== pokemonId);
    } else {
      favorites.push(pokemonId);
    }
    saveFavorites();
  }

  // Load initial generation
  loadGeneration(currentGeneration);

  // Generation buttons event listeners
  document.querySelectorAll(".starter-pokemon").forEach((button) => {
    button.addEventListener("click", () => {
      // Update active generation styling
      document
        .querySelector(".active-generation")
        .classList.remove("active-generation");
      button.classList.add("active-generation");

      const genNumber = button.getAttribute("data-gen");
      loadGeneration(genNumber);
    });
  });

  // Load Pokemon by generation
  function loadGeneration(genNumber) {
    currentGeneration = genNumber;
    const { start, end } = generationRanges[genNumber];

    // Clear previous results
    pokemonList = [];

    // Fetch pokemon data
    const promises = [];
    for (let i = start; i <= end; i++) {
      const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
      promises.push(
        fetch(url, { credentials: "omit" }).then((res) => res.json())
      );
    }

    Promise.all(promises).then((results) => {
      pokemonList = results;
      allPokemonList = [...results]; // Keep a copy for filtering

      // Load first pokemon details
      if (results.length > 0) {
        displayPokemonDetails(results[0]);
      }
    });
  }

  async function getEvolutionChainIds(pokemon) {
    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();

    const evoChainRes = await fetch(speciesData.evolution_chain.url);
    const evoChainData = await evoChainRes.json();

    const ids = [];
    let current = evoChainData.chain;

    while (current) {
      const name = current.species.name;
      const found = allPokemonList.find((p) => p.name === name);
      if (found) {
        ids.push(found.id);
      }
      current = current.evolves_to[0];
    }

    return ids;
  }

  // Display pokemon details
  async function displayPokemonDetails(pokemon) {
    const types = pokemon.types.map((typeInfo) => typeInfo.type.name);
    const mainType = types[0];
    const secondType = types[1] || null;

    // Set background color based on pokemon type
    document.querySelector(
      ".pokemon-details"
    ).style.backgroundColor = `${typeColors[mainType]}80`; // 50% opacity

    // Get evolution chain data
    let evolutions = await getEvolutionChainIds(pokemon);

    const statsHtml = pokemon.stats
      .map(
        (stat) => `
          <div class="info-row">
            <span class="info-label">${formatStatName(stat.stat.name)}:</span>
            <span>${stat.base_stat}</span>
          </div>
        `
      )
      .join("");

    const detailsHtml = `
          <h1 class="pokemon-name">${pokemon.name}</h1>
          <div class="type-tags">
            <div class="type-tag" style="background-color: ${
              typeColors[mainType]
            };">
              <img src="${
                typeIcons[mainType]
              }" alt="${mainType}" width="20" height="20" style="margin-right: 5px;">
              ${mainType}
            </div>
            ${
              secondType
                ? `
            <div class="type-tag" style="background-color: ${typeColors[secondType]};">
              <img src="${typeIcons[secondType]}" alt="${secondType}" width="20" height="20" style="margin-right: 5px;">
              ${secondType}
            </div>`
                : ""
            }
          </div>

          <div class="base-info">
            <div class="info-title">BASE INFO</div>
            <div class="info-row">
              <span class="info-label">Weight:</span>
              <span>${pokemon.weight / 10} kg</span>
            </div>
            <div class="info-row">
              <span class="info-label">Height:</span>
              <span>${pokemon.height / 10} m</span>
            </div>
            <div class="divider"></div>
            <div class="info-title">BASE STATS</div>
            ${statsHtml}
          </div>

          <div class="pokemon-id">#${pokemon.id
            .toString()
            .padStart(3, "0")}</div>
          <img class="pokemon-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
            pokemon.id
          }.png" alt="${pokemon.name}">
          
          <div class="type-filters">
            ${Object.keys(typeColors)
              .map(
                (type) => `
                <div class="type-filter" style="background-color: ${typeColors[type]};" data-type="${type}">
                  <img src="${typeIcons[type]}" alt="${type}" width="20" height="20">
                </div>
              `
              )
              .join("")}
            <button id="clear-filters-btn" style="padding: 5px 10px; margin-left: 10px; border-radius: 5px; border: none; cursor: pointer; background-color: #ffffffaa;">Clear Filters</button>
          </div>
          
          <div class="pokemon-cards-grid">
            ${pokemonList
              .map((pokemonItem) => {
                const itemTypes = pokemonItem.types.map(
                  (typeInfo) => typeInfo.type.name
                );
                const itemMainType = itemTypes[0];
                const itemSecondType = itemTypes[1] || null;

                return `
                <div class="pokemon-details-card" data-id="${pokemonItem.id}">
                  <img class="details-card-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
                    pokemonItem.id
                  }.png" alt="${pokemonItem.name}">
                  <p class="details-card-id">#${pokemonItem.id
                    .toString()
                    .padStart(3, "0")}</p>
                  <button class="favorite-btn" data-id="${pokemonItem.id}">
                    ${favorites.includes(pokemonItem.id) ? "★" : "☆"}
                  </button>
                  <h3 class="details-card-name">${pokemonItem.name}</h3>
                  <div class="details-card-types">
                    <div class="type-icon" style="background-color: ${
                      typeColors[itemMainType]
                    };">
                      <img class="type-image" src="${
                        typeIcons[itemMainType]
                      }" alt="${itemMainType}">
                    </div>
                    ${
                      itemSecondType
                        ? `
                    <div class="type-icon" style="background-color: ${typeColors[itemSecondType]};">
                      <img class="type-image" src="${typeIcons[itemSecondType]}" alt="${itemSecondType}">
                    </div>`
                        : ""
                    }
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
    `;

    document.getElementById("details-container").innerHTML = detailsHtml;

    // Add event listeners to evolution items
    document.querySelectorAll(".evolution-item").forEach((item) => {
      item.addEventListener("click", () => {
        const evoId = item.getAttribute("data-id");
        const evoPokemon = pokemonList.find((p) => p.id == evoId);
        if (evoPokemon) {
          displayPokemonDetails(evoPokemon);
        } else {
          // Fetch pokemon if not in current list
          fetch(`https://pokeapi.co/api/v2/pokemon/${evoId}`, { credentials: 'omit' })
            .then((res) => res.json())
            .then((pokemon) => {
              displayPokemonDetails(pokemon);
            });
        }
      });
    });

    // Add event listeners to pokemon detail cards
    document.querySelectorAll(".pokemon-details-card").forEach((card) => {
      card.addEventListener("click", () => {
        const pokemonId = card.getAttribute("data-id");
        const pokemon = pokemonList.find((p) => p.id == pokemonId);
        if (pokemon) {
          displayPokemonDetails(pokemon);
          // Scroll to top when selecting a new pokemon
          document.querySelector(".pokemon-details").scrollTop = 0;
        }
      });
    });

    document.querySelectorAll(".favorite-btn").forEach((btn) => {
      const id = parseInt(btn.getAttribute("data-id"));

      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent card click
        toggleFavorite(id);
        if (favorites.includes(id)) {
          btn.textContent = "★"; // filled star
        } else {
          btn.textContent = "☆"; // empty star
        }
      });
    });

    // Add event listeners to type filters
    document.querySelectorAll(".type-filter").forEach((filter) => {
      filter.addEventListener("click", () => {
        const type = filter.getAttribute("data-type");
        const filteredPokemon = allPokemonList.filter((p) =>
          p.types.some((t) => t.type.name === type)
        );

        // Update the pokemonList to the filtered list
        pokemonList = filteredPokemon;

        // Update the UI with the filtered pokemon
        if (filteredPokemon.length > 0) {
          displayPokemonDetails(filteredPokemon[0]);
        } else {
          document.getElementById("details-container").innerHTML = `
            <h2 class="text-center mt-10">No Pokémon of ${type} type found in this generation</h2>
          `;
        }
      });
    });

    const clearBtn = document.getElementById("clear-filters-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        pokemonList = [...allPokemonList];
        displayPokemonDetails(pokemonList[0]);
      });
    }
  }

  let showingFavorites = false;

  document.getElementById("toggle-favorites").addEventListener("click", () => {
    showingFavorites = !showingFavorites;
    const favoritesIcon = document.getElementById("favorites-icon");

    if (showingFavorites) {
      const favPokemon = allPokemonList.filter((p) => favorites.includes(p.id));
      pokemonList = favPokemon;
      favoritesIcon.src = "/images/Map_icon.png";
      favoritesIcon.alt = "Show All";
    } else {
      pokemonList = [...allPokemonList];
      favoritesIcon.src = "/images/my_pokemons.png";
      favoritesIcon.alt = "Show Favorites";
    }

    if (pokemonList.length > 0) {
      displayPokemonDetails(pokemonList[0]);
    } else {
      document.getElementById(
        "details-container"
      ).innerHTML = `<h2 class="text-center mt-10 text-2xl">No favorites yet!</h2>`;
    }
  });

  // Helper function for formatting stat names
  function formatStatName(statName) {
    return statName
      .replace("-", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
});
