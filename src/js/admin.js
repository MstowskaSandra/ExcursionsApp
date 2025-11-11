import './../css/admin.css';
import ExcursionsAPI from './ExcursionsAPI';

const api = new ExcursionsAPI();
const resp = api.loadExcursionsAdmin();
resp.then(excursionsArr => {
    const ulEl = document.querySelector(".excursions");
    const prototype = document.querySelector(".excursions__item--prototype");
    ulEl.innerHTML = '';
    
    excursionsArr.forEach(item => {
        const liEl = prototype.cloneNode(true);
        liEl.classList.remove('excursions__item--prototype');
        liEl.style.display = '';
        liEl.dataset.id = item.id;

        liEl.querySelector('.excursions__title').textContent = item.name;
        liEl.querySelector('.excursions__description').textContent = item.description;

        const priceLabels = liEl.querySelectorAll('.excursions__field-name strong');
        priceLabels[0].textContent = item.priceAdult;
        priceLabels[1].textContent = item.priceChild;

        ulEl.appendChild(liEl);
    });
});

const form = document.querySelector('.form');
form.addEventListener('submit', e => {
    e.preventDefault();
    console.log("Form captured - sending data");

    const { name, description, priceAdult, priceChild } = e.target.elements;
    const data = {
        name: name.value,
        description: description.value,
        priceAdult: Number(priceAdult.value),
        priceChild: Number(priceChild.value)
    };

    if(!data.name || !data.description) {
        alert('Please fill in the name and description of the trip.');
        return;
    }

    if (isNaN(data.priceAdult) || data.priceAdult <= 0 || isNaN(data.priceChild) || data.priceChild < 0) {
        alert("Please enter valid prices for adults and children.");
        return;
    }
    api.addExcursions(data)
     .then(data => {
        console.log("Added excursion:", data);
     })
    .catch(err => console.error(err))
    .finally(() => {
        form.reset();
    })

});

const ulEl = document.querySelector('.excursions');
     
ulEl.addEventListener('click', e => {
    const targetEl = e.target;

    if(targetEl.classList.contains('excursions__field-input--remove')) {
        const liEl = targetEl.closest('li.excursions__item');
        if (!liEl) return;
        const id = liEl.dataset.id;
        if (!id) return;
        api.removeExcursions(id);
    }  
});


ulEl.addEventListener('click', e => {
    e.preventDefault();
    const targetEl = e.target;
    console.log('Clicked:', targetEl);

    if(targetEl.classList.contains('excursions__field-input--update')) {
        console.log('Clicked edit button!');
        const liEl = targetEl.closest('li.excursions__item');
        if (!liEl) return;

        const titleEl = liEl.querySelector('.excursions__title');
        const descriptionEl = liEl.querySelector('.excursions__description');
        const priceLabels = liEl.querySelectorAll('.excursions__field-name strong');

        const isEditable = titleEl.isContentEditable;

        if (isEditable) {
            const id = liEl.dataset.id;
            const data = {
                name: titleEl.innerText,
                description: descriptionEl.innerText,
                priceAdult: Number(priceLabels[0].innerText),
                priceChild: Number(priceLabels[1].innerText)
            };
            api.updateExcursions(id, data)
                .then(respData => {
                    console.log("Updated:", respData)
                })
                .catch(err => console.error(err))
                .finally(() => {
                    targetEl.value = 'Edit';
                    titleEl.contentEditable = false;
                    descriptionEl.contentEditable = false;
                    priceLabels.forEach(span => {
                        span.contentEditable = false;
                        span.classList.remove('Remove');
                    });
                });
        } else {
            targetEl.value = 'zapisz';
            titleEl.contentEditable = true;
            descriptionEl.contentEditable = true;
            priceLabels.forEach(span => {
                span.contentEditable = true;
                span.classList.add('editing');
            });
        }
    }
});


const orders = api.loadOrders();
orders.then(ordersArr => {
    const ulEl = document.querySelector('.orders__list');
    const prototype = document.querySelector('.order-list__item--prototype');
    ulEl.innerHTML = '';

    ordersArr.forEach(item => {
        const liEl = prototype.cloneNode(true);
        liEl.classList.remove('order-list__item--prototype');
        liEl.style.display= '';
        liEl.dataset.id = item.id;

        liEl.querySelector('.order-list__item--title').textContent = `Order: ${item.id}`;
        liEl.querySelector('.order-list__item--client').textContent = `Client: ${item.name}`;
        liEl.querySelector('.order-list__item--email').textContent = `Email: ${item.email}`;
        liEl.querySelector('.order-list__item--data').textContent = `Data: ${item.orderDate}`;
        liEl.querySelector('.order-list__item--sum').textContent = `Total: ${item.totalPrice}zł`;


        const tbody = liEl.querySelector('tbody');
        tbody.innerHTML = '';

        const rowPrototype = prototype.querySelector('.table__row--prototype');
    
        item.basket.forEach((basketItem, index) => {
            const newRow = rowPrototype.cloneNode(true);
            newRow.classList.remove('table__row--prototype');
            newRow.style.display = '';

            newRow.querySelector('.table-row--index').textContent = index + 1;
            newRow.querySelector('.table-row--name').textContent = basketItem.excursion.name;
            newRow.querySelector('.table-row--adult').textContent = basketItem.adults;
            newRow.querySelector('.table-row--child').textContent = basketItem.childs;
            newRow.querySelector('.table-row--adultPrice').textContent = basketItem.excursion.priceAdult;
            newRow.querySelector('.table-row--childPrice').textContent = basketItem.excursion.priceChild;
            const sumItem = basketItem.adults * basketItem.excursion.priceAdult + basketItem.childs * basketItem.excursion.priceChild;
            newRow.querySelector('.table-row--sum').textContent = sumItem + 'zł';

            tbody.appendChild(newRow);
        });
       
        ulEl.appendChild(liEl);
    });
});

const viewButtons = document.querySelectorAll('.view-btn');
const views = document.querySelectorAll('.view');

document.querySelector('.view-switcher').addEventListener('click', e => {
    if (!e.target.classList.contains('view-btn')) return;

    viewButtons.forEach(b => b.classList.toggle('active', b === e.target));
    views.forEach(v => v.classList.toggle('active', v.id === `view${e.target.dataset.view[0].toUpperCase()}${e.target.dataset.view.slice(1)}`));
});

console.log('admin');