document.getElementById('fetchCat').addEventListener('click', async () => {
    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    const data = await response.json();
    const imageUrl = data[0].url;

    const catContainer = document.getElementById('catContainer');

    const catItem = document.createElement('div');
    catItem.classList.add('catItem');

    const catImage = document.createElement('img');
    catImage.src = imageUrl;
    catItem.appendChild(catImage);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'X';
    deleteBtn.classList.add('deleteBtn');
    deleteBtn.onclick = () => catItem.remove();
    catItem.appendChild(deleteBtn);

    catContainer.appendChild(catItem);
});
