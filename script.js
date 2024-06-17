const apiKey = process.env.API_KEY;

document.getElementById('fetchCat').addEventListener('click', async () => {
    try {
        const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=1&has_breeds=1&api_key=${apiKey}`);
        const data = await response.json();

        if (data.length === 0) {
            throw new Error("No images returned from API");
        }

        const imageUrl = data[0].url;
        const breedName = data[0].breeds.length > 0 ? data[0].breeds[0].name : 'Unknown Breed';

        const catContainer = document.getElementById('catContainer');

        const catItem = document.createElement('div');
        catItem.classList.add('catItem');

        const catImage = document.createElement('img');
        catImage.src = imageUrl;
        catItem.appendChild(catImage);

        const breedLabel = document.createElement('p');
        breedLabel.innerText = breedName;
        catItem.appendChild(breedLabel);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'X';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.onclick = () => catItem.remove();
        catItem.appendChild(deleteBtn);

        catContainer.appendChild(catItem);
    } catch (error) {
        console.error('Error fetching cat image:', error);
    }
});
