$(document).ready(function () {
    // Function to handle AJAX requests
    function fetchPokemonData(url, successCallback, errorCallback) {
        $.ajax({
            url: url,
            method: 'GET',
            success: successCallback,
            error: errorCallback
        });
    }

    let pokemonData = [];
    let allPokemonNames = [];

    function buildPokemonNameList() {
        for (let i = 1; i <= 151; i++) {
            const url = `https://pokeapi.co/api/v2/pokemon-species/${i}/`;
            fetchPokemonData(url, function (data) {
                const koreanName = data.names.find(name => name.language.name === 'ko')?.name;
                const englishName = data.names.find(name => name.language.name === 'en')?.name;
                if (koreanName) allPokemonNames.push(koreanName);
                if (englishName) allPokemonNames.push(englishName);

                if (i === 151) {
                    initializeAutocomplete();
                }
            }, handleError);
        }
    }

    function initializeAutocomplete() {
        $("#searchBox").autocomplete({
            source: function (request, response) {
                var term = request.term;
                var results = [];

                // Check if the input is Korean
                if (/[\u3131-\uD79D]/.test(term)) {
                    // For Korean, match from the beginning of the word
                    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
                    results = $.grep(allPokemonNames, function (item) {
                        return matcher.test(item);
                    });
                } else {
                    // For English, keep the existing behavior
                    var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
                    results = $.grep(allPokemonNames, function (item) {
                        return matcher.test(item);
                    });
                }
                response(results);
            },
            minLength: 1,  // Changed to 1 to show suggestions after the first character
            select: function (event, ui) {
                $("#searchBox").val(ui.item.value);
                $("#searchButton").click();
            }
        });
    }

    // Call this function when the page loads
    buildPokemonNameList();

    function fetchAndDisplayPokemon() {
        let fetchCount = 0;
        for (let i = 1; i <= 151; i++) {
            const url = `https://pokeapi.co/api/v2/pokemon/${i}/`;
            fetchPokemonData(url, function (data) {
                fetchPokemonSpeciesDataForCard(data.species.url, data.sprites.front_default, data.id, function (pokemonInfo) {
                    pokemonData.push(pokemonInfo);
                    fetchCount++;
                    if (fetchCount === 151) {
                        displaySortedPokemon();
                    }
                });
            }, handleError);
        }
    }

    function fetchPokemonSpeciesDataForCard(speciesUrl, spriteUrl, pokemonId, callback) {
        fetchPokemonData(speciesUrl, function (data) {
            const koreanName = data.names.find(name => name.language.name === 'ko');
            const displayName = koreanName ? koreanName.name : data.name;
            callback({
                id: pokemonId,
                name: displayName,
                sprite: spriteUrl
            });
        }, handleError);
    }

    function displaySortedPokemon() {
        pokemonData.sort((a, b) => a.id - b.id);
        const pokemonGrid = $('#pokemon-grid');
        pokemonGrid.empty();
        pokemonData.forEach(pokemon => {
            const pokemonHtml = `
                <div class="pokemon-card" data-id="${pokemon.id}">
                    <img src="${pokemon.sprite}" alt="${pokemon.name}">
                    <h3 style="text-transform: uppercase;">${pokemon.name}</h3>
                </div>
            `;
            pokemonGrid.append(pokemonHtml);
        });
    }

    // Function to fetch Pokémon data by name
    function fetchPokemonDataByName(pokemonName) {
        let searchName = pokemonName.toLowerCase();

        // Check if the input is in Korean
        if (/[\u3131-\uD79D]/.test(pokemonName)) {
            searchName = koreanToEnglishMap[pokemonName] || pokemonName;
        }

        const url = `https://pokeapi.co/api/v2/pokemon/${searchName}/`;
        fetchPokemonData(url, function (data) {
            displayPokemonDetails(data);
            fetchPokemonSpeciesData(data.species.url);
            $('#pokemon-type').html('');
            $('#pokemon-ability').html('');
            $('#pokemon-hidden-ability').html('');
            $('#pokemon-moves').html('');
            data.abilities.forEach(abilityInfo => {
                fetchPokemonAbilityData(abilityInfo.ability.url, abilityInfo.is_hidden);
            });
            data.types.forEach(typeInfo => {
                fetchPokemonTypeData(typeInfo.type.url);
            });
            data.moves.forEach(moveInfo => {
                fetchPokemonMoveData(moveInfo.move.url);
            });
        }, handleError);
    }

    // Function to fetch Pokémon data by ID
    function fetchPokemonDataById(pokemonId) {
        const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`;
        fetchPokemonData(url, function (data) {
            displayPokemonDetails(data);
            fetchPokemonSpeciesData(data.species.url);
            $('#pokemon-type').html(''); // Clear previous content
            $('#pokemon-ability').html(''); // Clear previous content
            $('#pokemon-hidden-ability').html(''); // Clear previous content
            $('#pokemon-moves').html(''); // Clear previous content
            data.abilities.forEach(abilityInfo => {
                fetchPokemonAbilityData(abilityInfo.ability.url, abilityInfo.is_hidden);
            });
            data.types.forEach(typeInfo => {
                fetchPokemonTypeData(typeInfo.type.url);
            });
            data.moves.forEach(moveInfo => {
                fetchPokemonMoveData(moveInfo.move.url);
            });
        }, handleError);
    }

    let koreanToEnglishMap = {};

    function buildKoreanNameMapping() {
        for (let i = 1; i <= 151; i++) {
            const url = `https://pokeapi.co/api/v2/pokemon-species/${i}/`;
            fetchPokemonData(url, function (data) {
                const koreanName = data.names.find(name => name.language.name === 'ko')?.name;
                const englishName = data.names.find(name => name.language.name === 'en')?.name;
                if (koreanName && englishName) {
                    koreanToEnglishMap[koreanName] = englishName.toLowerCase();
                }
            }, handleError);
        }
    }

    // Call this function when the page loads
    buildKoreanNameMapping();

    // Modify the fetchPokemonDataByName function
    function fetchPokemonDataByName(pokemonName) {
        let searchName = pokemonName.toLowerCase();

        // Check if the input is in Korean
        if (/[\u3131-\uD79D]/.test(pokemonName)) {
            searchName = koreanToEnglishMap[pokemonName] || pokemonName;
        }

        const url = `https://pokeapi.co/api/v2/pokemon/${searchName}/`;
        fetchPokemonData(url, function (data) {
            displayPokemonDetails(data);
            fetchPokemonSpeciesData(data.species.url);
            $('#pokemon-type').html('');
            $('#pokemon-ability').html('');
            $('#pokemon-hidden-ability').html('');
            $('#pokemon-moves').html('');
            data.abilities.forEach(abilityInfo => {
                fetchPokemonAbilityData(abilityInfo.ability.url, abilityInfo.is_hidden);
            });
            data.types.forEach(typeInfo => {
                fetchPokemonTypeData(typeInfo.type.url);
            });
            data.moves.forEach(moveInfo => {
                fetchPokemonMoveData(moveInfo.move.url);
            });
        }, handleError);
    }

    // Function to fetch Pokémon species data
    function fetchPokemonSpeciesData(speciesUrl) {
        fetchPokemonData(speciesUrl, function (data) {
            const koreanFlavorText = data.flavor_text_entries.find(entry => entry.language.name === 'ko');
            const koreanName = data.names.find(name => name.language.name === 'ko');
            const koreanGenus = data.genera.find(genus => genus.language.name === 'ko');

            if (koreanFlavorText) {
                $('#pokemon-flavor-text').text(koreanFlavorText.flavor_text);
            }

            if (koreanName) {
                $('#pokemon-name').text(koreanName.name);
            }

            if (koreanGenus) {
                $('#pokemon-species').text(koreanGenus.genus);
            }
        }, handleError);
    }

    // Function to fetch Pokémon ability data
    function fetchPokemonAbilityData(abilityUrl, isHidden) {
        fetchPokemonData(abilityUrl, function (data) {
            const koreanName = data.names.find(name => name.language.name === 'ko')?.name;
            const koreanFlavorText = data.flavor_text_entries.find(entry => entry.language.name === 'ko');
            const abilityName = koreanName || data.name;
            const abilityText = koreanFlavorText ? `${abilityName}: ${koreanFlavorText.flavor_text}` : abilityName;

            if (isHidden) {
                $('#pokemon-hidden-ability').append(`<p>${abilityText}</p>`);
            } else {
                $('#pokemon-ability').append(`<p>${abilityText}</p>`);
            }
        }, handleError);
    }

    // Function to fetch Pokémon type data
    function fetchPokemonTypeData(typeUrl) {
        fetchPokemonData(typeUrl, function (data) {
            const koreanTypeName = data.names.find(name => name.language.name === 'ko').name;
            $('#pokemon-type').append(`<p>${koreanTypeName}</p>`); // Use append() to add content
        }, handleError);
    }

    // Function to fetch Pokémon move data
    function fetchPokemonMoveData(moveUrl) {
        fetchPokemonData(moveUrl, function (data) {
            const koreanMoveName = data.names.find(name => name.language.name === 'ko').name;
            $('#pokemon-moves').append(`<li>${koreanMoveName}</li>`); // Use append() to add content
        }, handleError);
    }

    // Function to handle errors
    function handleError(error) {
        console.error('Error fetching Pokémon data:', error);
        alert('포켓몬을 찾지 못했습니다. 다시 검색하세요.');
    }

    // Function to display Pokémon details in a table
    function displayPokemonDetails(data) {
        const pokemonCryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`;
        const pokemonGifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif`;

        const previousPokemonId = data.id > 1 ? data.id - 1 : 151;
        const nextPokemonId = data.id < 151 ? data.id + 1 : 1;

        const pokemonTable = `
        <table border="2" cellspacing="1" width="500" height="500">
            <tr>
                <th class="th-red" id="pokemon-name" style="font-size: 1.2em; text-transform: uppercase;">${data.name}</th>
                <th class="th-black" id="pokemon-id">No.${data.id}</th>
            </tr>
            <tr>
                <td colspan="2" class="th-black"><img id="pokemon-image" src="${pokemonGifUrl}" width="230"></td>
            </tr>
            <tr>
                <td class="th-red">타입</td>
                <td class="th-red">분류</td>
            </tr>
            <tr>
                <td class="th-black" id="pokemon-type"></td>
                <td class="th-black" id="pokemon-species">Loading...</td>
            </tr>
            <tr>
                <td class="th-red">특성</td>
                <td class="th-red">숨겨진 특성</td>
            </tr>
            <tr>
                <td class="th-black" id="pokemon-ability"></td>
                <td class="th-black" id="pokemon-hidden-ability"></td>
            </tr>
           
            <tr>
                <td colspan="2" class="th-red">도감설명</td>
            </tr>
            <tr>
                <td colspan="2" class="th-black" id="pokemon-flavor-text"></td>
            </tr>

             <tr>
                <td colspan="2" class="th-red">울음소리</td>
            </tr>
            <tr>
                <td colspan="2" class="th-black"><audio controls src="${pokemonCryUrl}" type="audio/mpeg" style="width: 250px;"></audio></td>
            </tr>
            <tr>
                <td colspan="2" class="th-red">기술</td>
            </tr>
            <tr>
                <td colspan="2" class="th-black"><ul id="pokemon-moves" class="scrollable"></ul></td>
            </tr>
            <tr>
                <td colspan="2" class="th-black">
                    <button id="previous-pokemon" data-id="${previousPokemonId}">이전</button>
                    <button id="next-pokemon" data-id="${nextPokemonId}">다음</button>
                </td>
            </tr>
        </table>
        `;
        $('#pokemon-details').html(pokemonTable);
        $('#pokemon-details').show();
        $('#pokemon-grid').css('margin-top', '20px');

        // Add event listeners for navigation buttons
        $('#previous-pokemon').on('click', function () {
            const pokemonId = $(this).data('id');
            fetchPokemonDataById(pokemonId);
        });

        $('#next-pokemon').on('click', function () {
            const pokemonId = $(this).data('id');
            fetchPokemonDataById(pokemonId);
        });
    }

    // Fetch and display the first 151 Pokémon on page load
    fetchAndDisplayPokemon();

    // Search button event listener
    $('#searchButton').on('click', function () {
        const pokemonName = $('#searchBox').val();
        if (pokemonName) {
            fetchPokemonDataByName(pokemonName);
        } else {
            alert('포켓몬의 이름을 입력하세요.');
        }
    });

    // Add event listener for Enter key press in search box
    $('#searchBox').on('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            $('#searchButton').click();
        }
    });

    // Pokémon card click event listener
    $(document).on('click', '.pokemon-card', function () {
        const pokemonId = $(this).data('id');
        fetchPokemonDataById(pokemonId);
    });
});