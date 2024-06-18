
const apiKey = 'live_LsHNazQBwf0YVFhn5o1bfRGslDP7EOi3WzcMwBXFgeJD7iXJOWncjIINqMya5bYs';
let catItems = [];
let favoriteCats = []; 
let breedNames = [];

loadFavoritesFromLocalStorage();

document.getElementById('fetchCat').addEventListener('click', async () => fetchCatImages());
document.getElementById('createCat').addEventListener('click', () => openModal());
document.getElementById('showFavorites').addEventListener('click', () => showFavoriteCats());

// Carregar Gatos aleatórios
async function fetchCatImages() {
    try {
        const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=10&has_breeds=1&api_key=${apiKey}`);
        const data = await response.json();
        data.forEach(catData => {
            const imageUrl = catData.url;
            const breedName = catData.breeds[0]?.name ? catData.breeds[0].name : 'Raça desconhecida';
            const imageId = catData.id;

            // Colocando card de gatos no container
            const catContainer = document.getElementById('catContainer');

            // Criando card
            const catItem = document.createElement('div');
            catItem.classList.add('cat-item');
            // Adicionando imagem ao card
            const catImage = document.createElement('img');
            catImage.src = imageUrl;
            catItem.appendChild(catImage);
            // Adicionando raça ao card
            const breedLabel = document.createElement('p');
            breedLabel.innerText = breedName;
            catItem.appendChild(breedLabel);

            // Adicionando botões ao card
            const buttons = document.createElement('div')
            buttons.classList.add('buttons-div')

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

            catItem.appendChild(buttons)

            catContainer.appendChild(catItem);
            catItems.push(catItem);
        });
    } catch (error) {
        console.error('Erro na API', error);
    }
}

// Modal para Editar Gato
// Função para abrir o modal de edição
// Função para abrir o modal de edição
// Função para abrir o modal de edição
function openModal(breedData = null, catImage = null, catItem = null) {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    const saveBtn = document.getElementById('saveEdit');
    const catBreedDropdown = document.getElementById('catBreedDropdown');
    const currentCatImage = document.getElementById('currentCatImage');

    modal.style.display = 'block';

    // Limpa o dropdown atual e adiciona as opções de raças
    catBreedDropdown.innerHTML = '';
    breedNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.innerText = name;
        catBreedDropdown.appendChild(option);
    });

    // Seleciona a raça atual no dropdown, se existir
    if (breedData && breedData.innerText) {
        catBreedDropdown.value = breedData.innerText.trim(); // Seleciona a raça no dropdown
        currentCatImage.src = catImage.src;
    } else {
        currentCatImage.src = '';
    }

    closeBtn.onclick = () => modal.style.display = 'none';
    saveBtn.onclick = () => {
        const breedLabel = catBreedDropdown.value; // Obtém a raça selecionada
        if (breedLabel) {
            // Atualiza o label da raça no modal
            if (breedData) {
                breedData.innerText = breedLabel;
            }

            console.log('Raça selecionada:', breedLabel);
            modal.style.display = 'none';
        } else {
            console.error('Nenhuma raça selecionada');
        }
    };

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };
}



document.getElementById('searchBreed').addEventListener('input', () => {
    const searchTerm = document.getElementById('searchBreed').value.toLowerCase();
    const catContainer = document.getElementById('catContainer');
    catContainer.innerHTML = ''; // Limpa o conteúdo atual do container

    catItems.forEach(catItem => {
        const breedLabel = catItem.querySelector('p').innerText.toLowerCase();

        if (breedLabel.startsWith(searchTerm)) {
            catContainer.appendChild(catItem); // Adiciona o catItem que corresponde à pesquisa
        }
    });
});


// Criar Gato
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

// Carrega card de gato favorito
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

    // Atualiza LocalStorage
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
// Mostrar Gatos Favoritos
async function showFavoriteCats() {
    const catContainer = document.getElementById('catContainer');
    catContainer.innerHTML = ''; // Limpa o container para mostrar apenas favoritos

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



// Array para armazenar os nomes das raças

// Função para carregar nomes das raças da API
async function loadBreedNames() {
    try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds');
        const data = await response.json();
        breedNames = data.map(breed => breed.name);
        console.log(breedNames)
    } catch (error) {
        console.error('Erro ao carregar nomes das raças:', error);
    }
}

// Chamar a função para carregar os nomes das raças
loadBreedNames();
