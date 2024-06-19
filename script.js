const apiKey = 'live_LsHNazQBwf0YVFhn5o1bfRGslDP7EOi3WzcMwBXFgeJD7iXJOWncjIINqMya5bYs';
let catItems = [];
let favoriteCats = [];
let breedNames = [];

loadFavoritesFromLocalStorage();

document.getElementById('fetchCat').addEventListener('click', async () => fetchCatImages());
document.getElementById('createCat').addEventListener('click', () => openModal());
document.getElementById('showFavorites').addEventListener('click', () => showFavoriteCats());

// Carregar Gatos Aleatórios
async function fetchCatImages() {
    try {
        const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=10&has_breeds=1&api_key=${apiKey}`);
        const data = await response.json();
        data.forEach(catData => {
            const imageUrl = catData.url;
            const breedName = catData.breeds[0]?.name ? catData.breeds[0].name : 'Raça desconhecida';
            const imageId = catData.id;

            const catContainer = document.getElementById('catContainer');
            const catItem = document.createElement('div');
            catItem.classList.add('cat-item');

            const catImage = document.createElement('img');
            catImage.src = imageUrl;
            catItem.appendChild(catImage);

            const breedLabel = document.createElement('p');
            breedLabel.innerText = breedName;
            catItem.appendChild(breedLabel);

            const buttons = document.createElement('div');
            buttons.classList.add('buttons-div');

            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = 'X';
            deleteBtn.classList.add('deleteBtn');
            deleteBtn.onclick = () => {
                catItem.remove();
                catItems = catItems.filter(item => item !== catItem);
            };
            buttons.appendChild(deleteBtn);

            const editBtn = document.createElement('button');
            editBtn.innerText = 'E';
            editBtn.classList.add('editBtn');
            editBtn.onclick = () => openModal(breedLabel, catImage, catItem);
            buttons.appendChild(editBtn);

            const favBtn = document.createElement('button');
            favBtn.innerText = '❤';
            favBtn.classList.add('favBtn');
            favBtn.onclick = () => toggleFavourite(catItem, imageId);
            buttons.appendChild(favBtn);

            catItem.appendChild(buttons);
            catContainer.appendChild(catItem);
            catItems.push(catItem);
        });
    } catch (error) {
        console.error('Erro na API', error);
    }
}

function openModal(breedData = null, catImage = null, catItem = null) {
    // Criando Botões
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    const saveBtn = document.getElementById('saveEdit');
    const catBreedDropdown = document.getElementById('catBreedDropdown');
    const catImageUpload = document.getElementById('catImageUpload');
    const currentCatImage = document.getElementById('currentCatImage');
    const addBreedButton = document.getElementById('addBreedButton');
    const addBreedModal = document.getElementById('addBreedModal');
    const newBreedNameInput = document.getElementById('newBreedName');
    const saveNewBreedButton = document.getElementById('saveNewBreed');
    const updateBreedButton = document.getElementById('updateBreedButton');

    catBreedDropdown.innerHTML = '';
    breedNames.forEach(breed => {
        const option = document.createElement('option');
        option.value = breed;
        option.innerText = breed;
        catBreedDropdown.appendChild(option);
    });

    if (breedData && catImage) {
        catBreedDropdown.value = breedData.innerText;
        currentCatImage.src = catImage.src;
    } else {
        catBreedDropdown.value = '';
        currentCatImage.src = '';
    }

    modal.style.display = 'block';

    catImageUpload.addEventListener('change', () => {
        const file = catImageUpload.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            currentCatImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    closeBtn.onclick = () => modal.style.display = 'none';
    saveBtn.onclick = () => {
        const breedLabel = catBreedDropdown.value;
        if (breedLabel) {
            if (breedData) {
                breedData.innerText = breedLabel;
            }

            if (catItem) {
                const catItemImg = catItem.querySelector('img');
                catItemImg.src = currentCatImage.src;
            } else {
                const breedName = breedLabel;
                const imageFile = catImageUpload.files[0];
                createCat(breedName, imageFile);
            }

            modal.style.display = 'none';
        } else {
            console.error('Nenhuma raça selecionada');
        }
    };

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };

    addBreedButton.onclick = () => addBreedModal.style.display = 'block';
    saveNewBreedButton.onclick = () => {
        const newBreedName = newBreedNameInput.value.trim();
        if (newBreedName) {
            breedNames.push(newBreedName);
            const option = document.createElement('option');
            option.value = newBreedName;
            option.innerText = newBreedName;
            catBreedDropdown.appendChild(option);
            addBreedModal.style.display = 'none';
        }
    };

    updateBreedButton.onclick = () => openUpdateBreedModal(catBreedDropdown.value);
}

function openUpdateBreedModal(selectedBreed) {
    const updateModal = document.getElementById('updateBreedModal');
    const closeBtn = updateModal.querySelector('.close');
    const saveBtn = document.getElementById('saveUpdatedBreed');
    const deleteBtn = document.getElementById('deleteBreed');

    const updateCatBreedDropdown = document.getElementById('updateCatBreedDropdown');
    const updatedBreedNameInput = document.getElementById('updatedBreedName');

    updateCatBreedDropdown.innerHTML = '';
    breedNames.forEach(breed => {
        const option = document.createElement('option');
        option.value = breed;
        option.innerText = breed;
        updateCatBreedDropdown.appendChild(option);
    });

    updateCatBreedDropdown.value = selectedBreed;
    updatedBreedNameInput.value = '';

    updateModal.style.display = 'block';

    closeBtn.onclick = () => updateModal.style.display = 'none';
    saveBtn.onclick = () => {
        const selectedBreed = updateCatBreedDropdown.value;
        const newBreedName = updatedBreedNameInput.value.trim();
        if (selectedBreed && newBreedName) {
            const breedIndex = breedNames.indexOf(selectedBreed);
            if (breedIndex !== -1) {
                breedNames[breedIndex] = newBreedName;
                const catBreedDropdown = document.getElementById('catBreedDropdown');
                const updateCatBreedDropdown = document.getElementById('updateCatBreedDropdown');

                catBreedDropdown.options[breedIndex].innerText = newBreedName;
                updateCatBreedDropdown.options[breedIndex].innerText = newBreedName;

                updateModal.style.display = 'none';
            }
        } else {
            console.error('Selecione uma raça e forneça um novo nome');
        }
    };

    deleteBtn.onclick = () => {
        const selectedBreed = updateCatBreedDropdown.value;
        if (selectedBreed) {
            const breedIndex = breedNames.indexOf(selectedBreed);
            if (breedIndex !== -1) {
                breedNames.splice(breedIndex, 1); 
                updateCatBreedDropdown.remove(breedIndex); 
                updateModal.style.display = 'none';
            }
        } else {
            console.error('Selecione uma raça para deletar');
        }
    };

    window.onclick = (event) => {
        if (event.target == updateModal) updateModal.style.display = 'none';
    };
}

document.getElementById('searchBreed').addEventListener('input', () => {
    const searchTerm = document.getElementById('searchBreed').value.toLowerCase();
    const catContainer = document.getElementById('catContainer');
    catContainer.innerHTML = '';

    catItems.forEach(catItem => {
        const breedLabel = catItem.querySelector('p').innerText.toLowerCase();

        if (breedLabel.startsWith(searchTerm)) {
            catContainer.appendChild(catItem);
        }
    });
});

function createCat(breedName, imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageUrl = e.target.result;

        const catContainer = document.getElementById('catContainer');
        const catItem = document.createElement('div');
        catItem.classList.add('cat-item');

        const catImage = document.createElement('img');
        catImage.src = imageUrl;
        catItem.appendChild(catImage);

        const breedLabel = document.createElement('p');
        breedLabel.innerText = breedName;
        catItem.appendChild(breedLabel);

        const buttons = document.createElement('div');
        buttons.classList.add('buttons-div');

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'X';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.onclick = () => {
            catItem.remove();
            catItems = catItems.filter(item => item !== catItem);
        };
        buttons.appendChild(deleteBtn);

        const editBtn = document.createElement('button');
        editBtn.innerText = 'E';
        editBtn.classList.add('editBtn');
        editBtn.onclick = () => openModal(breedLabel, catImage, catItem);
        buttons.appendChild(editBtn);

        const favBtn = document.createElement('button');
        favBtn.innerText = '❤';
        favBtn.classList.add('favBtn');
        favBtn.onclick = () => toggleFavourite(catItem);
        buttons.appendChild(favBtn);

        catItem.appendChild(buttons);
        catContainer.appendChild(catItem);
        catItems.push(catItem);
    };
    reader.readAsDataURL(imageFile);
}

function toggleFavourite(catItem) {
    const favBtn = catItem.querySelector('.favBtn');
    const isFavourited = favBtn.classList.toggle('favourited');

    const breedLabel = catItem.querySelector('p').innerText;
    const catImage = catItem.querySelector('img').src;

    if (isFavourited) {
        favoriteCats.push({ breed: breedLabel, image: catImage });
    } else {
        favoriteCats = favoriteCats.filter(cat => cat.breed !== breedLabel);
    }

    saveFavoritesToLocalStorage();
}

function saveFavoritesToLocalStorage() {
    localStorage.setItem('favoriteCats', JSON.stringify(favoriteCats));
}

function loadFavoritesFromLocalStorage() {
    const storedFavorites = localStorage.getItem('favoriteCats');
    if (storedFavorites) {
        favoriteCats = JSON.parse(storedFavorites);
    }
}

async function showFavoriteCats() {
    const catContainer = document.getElementById('catContainer');
    catContainer.innerHTML = '';

    favoriteCats.forEach(favCat => {
        const catItem = document.createElement('div');
        catItem.classList.add('cat-item');

        const catImage = document.createElement('img');
        catImage.src = favCat.image;
        catItem.appendChild(catImage);

        const breedLabel = document.createElement('p');
        breedLabel.innerText = favCat.breed;
        catItem.appendChild(breedLabel);

        const buttons = document.createElement('div');
        buttons.classList.add('buttons-div');

        const editBtn = document.createElement('button');
        editBtn.innerText = 'E';
        editBtn.classList.add('editBtn');
        editBtn.onclick = () => openModal(breedLabel, catImage, catItem);
        buttons.appendChild(editBtn);

        const favBtn = document.createElement('button');
        favBtn.innerText = '❤';
        favBtn.classList.add('favBtn', 'favourited');
        favBtn.onclick = () => toggleFavourite(catItem);
        buttons.appendChild(favBtn);

        catItem.appendChild(buttons);
        catContainer.appendChild(catItem);
    });
}

async function loadBreedNames() {
    try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds');
        const data = await response.json();
        breedNames = data.map(breed => breed.name);
        console.log(breedNames);
    } catch (error) {
        console.error('Erro ao carregar nomes das raças:', error);
    }
}

loadBreedNames();
