const apiKey = 'live_LsHNazQBwf0YVFhn5o1bfRGslDP7EOi3WzcMwBXFgeJD7iXJOWncjIINqMya5bYs';
let catItems = [];
let favoriteCats = [];
let breedNames = [];

loadFavoritesFromLocalStorage();

document.getElementById('fetchCat').addEventListener('click', async () => fetchCatImages());
document.getElementById('createCat').addEventListener('click', () => openModal());
document.getElementById('showFavorites').addEventListener('click', () => showFavoriteCats());

// Objeto para representar um gato
class Cat {
    constructor(imageUrl, breedName, imageId) {
        this.imageUrl = imageUrl;
        this.breedName = breedName;
        this.imageId = imageId;
    }
}

// Carregar 10 Gatos Aleatórios
async function fetchCatImages() {
    try {
        const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=10&has_breeds=1&api_key=${apiKey}`);
        const data = await response.json();

        // Limpar container antes de adicionar novos gatos
        const catContainer = document.getElementById('catContainer');
        catContainer.innerHTML = '';
        catItems = [];

        // Loop para carregar cada gato
        data.forEach(catData => {
            const imageUrl = catData.url;
            const breedName = catData.breeds[0]?.name ? catData.breeds[0].name : 'Raça desconhecida';
            const imageId = catData.id;

            // Criar objeto Cat
            const cat = new Cat(imageUrl, breedName, imageId);
            catItems.push(cat);

            // Criar elementos HTML para exibir o gato
            const catItem = document.createElement('div');
            catItem.classList.add('cat-item');

            // Criar campo imagem 
            const catImage = document.createElement('img');
            catImage.src = imageUrl;
            catItem.appendChild(catImage);

            // Criar campo raça
            const breedLabel = document.createElement('p');
            breedLabel.innerText = breedName;
            catItem.appendChild(breedLabel);

            // Criar botões
            const buttons = document.createElement('div');
            buttons.classList.add('buttons-div');

            // botão deletar
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = 'X';
            deleteBtn.classList.add('deleteBtn');
            deleteBtn.onclick = () => {
                catItem.remove();
                catItems = catItems.filter(item => item !== cat);
            };
            buttons.appendChild(deleteBtn);

            // botão editar
            const editBtn = document.createElement('button');
            editBtn.innerText = 'E';
            editBtn.classList.add('editBtn');
            editBtn.onclick = () => openModal(breedLabel, catImage, catItem);
            buttons.appendChild(editBtn);

            // botão favorito
            const favBtn = document.createElement('button');
            favBtn.innerText = '❤';
            favBtn.classList.add('favBtn');
            favBtn.onclick = () => toggleFavourite(catItem, imageId);
            buttons.appendChild(favBtn);

            catItem.appendChild(buttons);
            catContainer.appendChild(catItem);
        });
    } catch (error) {
        console.error('Erro na API', error);
    }
}

// Modal para criar e editar Gatos
function openModal(breedData = null, catImage = null, catItem = null) {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    const saveBtn = document.getElementById('saveEdit');
    const catBreedDropdown = document.getElementById('catBreedDropdown');
    const catImageUpload = document.getElementById('catImageUpload');
    const currentCatImage = document.getElementById('currentCatImage');
    const modalTitle = document.getElementById('modal-title');

    // Loop para carregar as raças na lista
    catBreedDropdown.innerHTML = '';
    breedNames.forEach(breed => {
        const option = document.createElement('option');
        option.value = breed;
        option.innerText = breed;
        catBreedDropdown.appendChild(option);
    });

    // Verificar se é criação ou edição
    // Condicional
    if (breedData && catImage) {
        // abrir com campos preenchidos, titulo atualizar gato
        catBreedDropdown.value = breedData.innerText;
        currentCatImage.src = catImage.src;
        modalTitle.innerText = 'Atualizar Gato';
    } else {
        // Abrir com campos em branco, titulo criar gato
        catBreedDropdown.value = ''; // Limpar seleção anterior
        currentCatImage.src = '';
        modalTitle.innerText = 'Criar Gato';
    }

    modal.style.display = 'block';

    // Atualizar imagem do gato ao selecionar um arquivo
    catImageUpload.addEventListener('change', () => {
        const file = catImageUpload.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            currentCatImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Fechar modal
    closeBtn.onclick = () => modal.style.display = 'none';

    // Salvar gato
    saveBtn.onclick = (event) => {
        event.preventDefault();

        const breedLabel = catBreedDropdown.value;
        if (breedLabel) {
            if (breedData) {
                breedData.innerText = breedLabel;
                // Gato já existe, atualizar card existente
                if (catItem) {
                    const catIndex = catItems.findIndex(cat => cat.imageUrl === catImage.src);
                    if (catIndex !== -1) {
                        catItems[catIndex].breedName = breedLabel;
                        const catItemImg = catItem.querySelector('img');
                        catItemImg.src = currentCatImage.src;
                    }
                } else {
                    // Gato não existe, criar card
                    const imageFile = catImageUpload.files[0];
                    // Função criar gato
                    createCat(breedLabel, imageFile);
                }
                modal.style.display = 'none';
            } else {
                const imageFile = catImageUpload.files[0];
                createCat(breedLabel, imageFile);
                modal.style.display = 'none';
            }
        } else {
            console.error('Nenhuma raça selecionada');
        }
    };

    // Adicionar nova raça
    const addBreedButton = document.getElementById('addBreedButton');
    const addBreedModal = document.getElementById('addBreedModal');
    const closeBreedModal = document.querySelector('.close-breed-modal');
  
    // Abrir modal
    addBreedButton.onclick = (e) => { 
            e.preventDefault()
            addBreedModal.style.display = 'block';
    }

    // Fechar modal
    closeBreedModal.onclick = () => { 
            addBreedModal.style.display = 'none';
    }

    // Salvar nova raça
    const saveNewBreedButton = document.getElementById('saveNewBreed');
    saveNewBreedButton.onclick = () => {
        const newBreedNameInput = document.getElementById('newBreedName');
        const newBreedName = newBreedNameInput.value.trim();
        if (newBreedName) {
            // Adicionar à lista de raças
            breedNames.push(newBreedName);
            const option = document.createElement('option');
            option.value = newBreedName;
            option.innerText = newBreedName;
            catBreedDropdown.appendChild(option);
            addBreedModal.style.display = 'none';
        } else {
            console.error('Nome da raça não pode ser vazio');
        }
    };
}

// Função para criar um novo gato
function createCat(breedName, imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageUrl = e.target.result;

        // Criar objeto Cat
        const cat = new Cat(imageUrl, breedName, Date.now()); // Usando Date.now() como ID único temporário

        // Adicionar o novo gato à lista catItems
        catItems.push(cat);

        // Exibir o novo gato no catContainer
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

        // Botão para excluir gato
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'X';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.onclick = () => {
            catItem.remove();
            catItems = catItems.filter(item => item !== cat);
        };
        buttons.appendChild(deleteBtn);

        // Botão para editar gato
        const editBtn = document.createElement('button');
        editBtn.innerText = 'E';
        editBtn.classList.add('editBtn');
        // Abre modal de edição
        editBtn.onclick = () => openModal(breedLabel, catImage, catItem);
        buttons.appendChild(editBtn);

        // Botão de favorito
        const favBtn = document.createElement('button');
        favBtn.innerText = '❤';
        favBtn.classList.add('favBtn');
        // Ao clicar, salva como favorito
        favBtn.onclick = () => toggleFavourite(catItem);
        buttons.appendChild(favBtn);

        catItem.appendChild(buttons);
        catContainer.appendChild(catItem);
    };
    reader.readAsDataURL(imageFile);
}

// Função para marcar/desmarcar como favorito
function toggleFavourite(catItem) {
    const favBtn = catItem.querySelector('.favBtn');
    const isFavourited = favBtn.classList.toggle('favourited');

    const breedLabel = catItem.querySelector('p').innerText;
    const cat = catItems.find(cat => cat.breedName === breedLabel);

    if (isFavourited) {
        // Salvando objeto dentro do array, gatos favoritos
        favoriteCats.push({ breed: cat.breedName, image: cat.imageUrl });
    } else {
        favoriteCats = favoriteCats.filter(favCat => favCat.breed !== cat.breedName);
    }

    // Salvar favoritos no armazenamento local
    saveFavoritesToLocalStorage();
}

// Função para salvar favoritos no armazenamento local
function saveFavoritesToLocalStorage() {
    localStorage.setItem('favoriteCats', JSON.stringify(favoriteCats));
}

// Carregar favoritos do armazenamento local
function loadFavoritesFromLocalStorage() {
    const storedFavorites = localStorage.getItem('favoriteCats');
    if (storedFavorites) {
        favoriteCats = JSON.parse(storedFavorites);
    }
}

// Mostrar gatos favoritos
async function showFavoriteCats() {
    const catContainer = document.getElementById('catContainer');
    catContainer.innerHTML = '';

    // Loop para mostrar gatos favoritos
    favoriteCats.forEach(favCat => {
        const catItem = document.createElement('div');
        catItem.classList.add('cat-item');

        // Criar imagem
        const catImage = document.createElement('img');
        catImage.src = favCat.image;
        catItem.appendChild(catImage);

        // Criar raça
        const breedLabel = document.createElement('p');
        breedLabel.innerText = favCat.breed;
        catItem.appendChild(breedLabel);

        const buttons = document.createElement('div');
        buttons.classList.add('buttons-div');

        // Botão editar
        const editBtn = document.createElement('button');
        editBtn.innerText = 'E';
        editBtn.classList.add('editBtn');
        editBtn.onclick = () => {
            const cat = catItems.find(cat => cat.breedName === favCat.breed);
            if (cat) {
                openModal(breedLabel, catImage, catItem);
            }
        };
        buttons.appendChild(editBtn);

        // Botão favorito
        const favBtn = document.createElement('button');
        favBtn.innerText = '❤';
        favBtn.classList.add('favBtn', 'favourited');
        favBtn.onclick = () => toggleFavourite(catItem);
        buttons.appendChild(favBtn);

        catItem.appendChild(buttons);
        catContainer.appendChild(catItem);
    });
}

// Carregar todas as raças disponíveis
async function loadBreedNames() {
    try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds');
        const data = await response.json();
        breedNames = data.map(breed => breed.name);
    } catch (error) {
        console.error('Erro ao carregar nomes das raças:', error);
    }
}

loadBreedNames();