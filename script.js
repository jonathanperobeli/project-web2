const apiKey = 'live_LsHNazQBwf0YVFhn5o1bfRGslDP7EOi3WzcMwBXFgeJD7iXJOWncjIINqMya5bYs';
const subId = 'user-sub-id'; // Substitua pelo ID do seu usuário, se aplicável
let catItems = [];
let currentCatItem = null;

document.getElementById('fetchCat').addEventListener('click', async () => {
    fetchCatImages();
});

document.getElementById('createCat').addEventListener('click', () => {
    openModal();
});

document.getElementById('showFavorites').addEventListener('click', () => {
    showFavoriteCats();
});

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
            favBtn.onclick = () => toggleFavourite(imageId, favBtn);
            buttons.appendChild(favBtn);

            catItem.appendChild(buttons)

            catContainer.appendChild(catItem);
            catItems.push(catItem);
        });
    } catch (error) {
        console.error('Erro na API', error);
    }
}

function openModal(breedLabel = null, catImage = null, catItem = null) {
    currentCatItem = catItem;
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    const saveBtn = document.getElementById('saveEdit');
    const catBreedInput = document.getElementById('catBreed');
    const catImageUpload = document.getElementById('catImageUpload');
    const currentCatImage = document.getElementById('currentCatImage');

    modal.style.display = 'block';

    if (breedLabel) {
        catBreedInput.value = breedLabel.innerText;
        currentCatImage.src = catImage.src;
    } else {
        catBreedInput.value = '';
        currentCatImage.src = '';
    }

    closeBtn.onclick = () => modal.style.display = 'none';
    saveBtn.onclick = () => {
        if (breedLabel) {
            breedLabel.innerText = catBreedInput.value;
            if (catImageUpload.files && catImageUpload.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    catImage.src = e.target.result;
                    modal.style.display = 'none';
                };
                reader.readAsDataURL(catImageUpload.files[0]);
            } else {
                modal.style.display = 'none';
            }
        } else {
            createCat(catBreedInput.value, catImageUpload.files[0]);
            modal.style.display = 'none';
        }
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

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
        favBtn.onclick = () => toggleFavourite(null, favBtn);
        buttons.appendChild(favBtn);

        catItem.appendChild(buttons);
        catContainer.appendChild(catItem);
        catItems.push(catItem);
    };
    reader.readAsDataURL(imageFile);
}

document.getElementById('searchBreed').addEventListener('input', (event) => {
    const searchValue = event.target.value.toLowerCase();
    catItems.forEach(catItem => {
        const breedLabel = catItem.querySelector('p').innerText.toLowerCase();
        if (breedLabel.startsWith(searchValue)) {
            catItem.style.display = 'inline-block';
        } else {
            catItem.style.display = 'none';
        }
    });
});

async function toggleFavourite(imageId, favBtn) {
    const isFavourited = favBtn.classList.toggle('favourited');
    if (isFavourited) {
        // Favoritar a imagem
        try {
            const rawBody = JSON.stringify({ image_id: imageId, sub_id: subId });
            const response = await fetch('https://api.thecatapi.com/v1/favourites', {
                method: 'POST',
                headers: { 
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: rawBody
            });
            const data = await response.json();
            favBtn.dataset.favouriteId = data.id; // Armazena o ID do favorito
        } catch (error) {
            console.error('Error favouriting image:', error);
            // Reverter o estado do botão em caso de erro
            favBtn.classList.remove('favourited');
        }
    } else {
        // Desfavoritar a imagem
        try {
            const favouriteId = favBtn.dataset.favouriteId;
            await fetch(`https://api.thecatapi.com/v1/favourites/${favouriteId}`, {
                method: 'DELETE',
                headers: { 'x-api-key': apiKey }
            });
        } catch (error) {
            console.error('Error unfavouriting image:', error);
            // Reverter o estado do botão em caso de erro
            favBtn.classList.add('favourited');
        }
    }
}

async function showFavoriteCats() {
    try {
        const response = await fetch(`https://api.thecatapi.com/v1/favourites?sub_id=${subId}`, {
            headers: { 'x-api-key': apiKey }
        });
        const data = await response.json();

        const catContainer = document.getElementById('catContainer');
        catContainer.innerHTML = ''; // Limpa o container para mostrar apenas favoritos

        for (const fav of data) {
            const imageId = fav.image_id;

            // Fetch the image details to get the breed information
            const imageResponse = await fetch(`https://api.thecatapi.com/v1/images/${imageId}`, {
                headers: { 'x-api-key': apiKey }
            });
            const imageData = await imageResponse.json();
            const imageUrl = imageData.url;
            const breedName = imageData.breeds[0]?.name ? imageData.breeds[0].name : 'Raça desconhecida';

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

            const favBtn = document.createElement('button');
            favBtn.innerText = '❤';
            favBtn.classList.add('favBtn', 'favourited');
            favBtn.dataset.favouriteId = fav.id;
            favBtn.onclick = () => toggleFavourite(imageId, favBtn);
            buttons.appendChild(favBtn);

            catItem.appendChild(buttons);
            catContainer.appendChild(catItem);
            catItems.push(catItem);
        }
    } catch (error) {
        console.error('Error fetching favourites:', error);
    }
}

// Inicializa a aplicação
fetchCatImages(); // Inicialmente busca imagens de gatos
