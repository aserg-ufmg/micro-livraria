function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content">
                    <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                    <p class="is-size-6">Disponível em estoque: 5</p>
                    <h4 class="is-size-3 title">${book.name}</h4>
                    <p class="subtitle">${book.author}</p>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button is-info"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button is-success is-fullwidth">Comprar</button>
                </div>
            </div>
        </div>`;
    return div;
}

const books = document.querySelector('.books');

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                });
            }
        });
});
