import './../css/client.css';
import ExcursionsAPI from './ExcursionsAPI';
const api = new ExcursionsAPI();

function insertExcursionsClient(excursionsArr) {
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

        const priceLabels = liEl.querySelectorAll('.excursions__field-name');
        priceLabels[0].innerHTML = `Adult: ${item.priceAdult}PLN x <input class="excursions__field-input" name="adults" />`;
        priceLabels[1].innerHTML = `Child: ${item.priceChild}PLN x <input class="excursions__field-input" name="children" />`;
        liEl.querySelector('.excursions__form').dataset.id = item.id;

        ulEl.appendChild(liEl);
    });       
}


api.loadExcursionsClient()
    .then(data => {
        console.log("API", data);
        api.data = data;
        insertExcursionsClient(data);
    })
    .catch(err => console.error(err));

let basket = [];
let counter = 0;

const ulEl = document.querySelector('.excursions');
ulEl.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.classList.contains('excursions__form')) {
        checkData(e);
        e.target.reset();
    };   
});


function checkData(e) {
    e.preventDefault();
    console.log('test');

    const adults = Number(e.target.elements.adults.value);
    const childs = Number(e.target.elements.children.value);

    if ( isNaN(adults) || isNaN(childs)) {
        alert("Please enter the number of participants.");
        return;
    }
    if(adults + childs === 0) {
        alert("At least one participant is required.");
        return;
    }

    const excursionId = e.target.dataset.id;
    const excursion = api.data.find(item => item.id === excursionId);

    basket.push({
        id: counter++,
        excursion,
        adults,
        childs
    });
    renderBasket();
    console.log("B:", basket);
}

function renderBasket() {
    const ulEl = document.querySelector('.summary');
    const proto = document.querySelector('.summary__item--prototype');
    ulEl.innerHTML = '';

    basket.forEach(item => {
        const priceAdult = parseFloat(item.excursion.priceAdult);
        const priceChild = parseFloat(item.excursion.priceChild);
        const total = priceAdult * item.adults + priceChild * item.childs;

        const liEl = proto.cloneNode(true);
        liEl.classList.remove('summary__item--prototype');
        liEl.style.display = '';
        liEl.dataset.id = item.id;

        liEl.querySelector('.summary__name').textContent = item.excursion.name;
        liEl.querySelector('.summary__total-price').textContent = total + "PLN";
        liEl.querySelector('.summary__prices').textContent = `Adults: ${item.adults} x ${priceAdult}PLN, childs: ${item.childs} x ${priceChild}PLN`;
        
        const btn = liEl.querySelector('.summary__btn-remove');
        btn.addEventListener('click', removeFromBasket);

        ulEl.appendChild(liEl);
        orderTotalPrice();
    });         
};

function removeFromBasket(e) {
    e.preventDefault();
    const li = e.target.closest(".summary__item");
    const id = Number(li.dataset.id);

    basket = basket.filter(item => item.id !== id);
    renderBasket();
}

function orderTotalPrice() {
    const summaryPrice = basket.map(item => {
        const priceAdult = parseFloat(item.excursion.priceAdult);
        const priceChild = parseFloat(item.excursion.priceChild);
        return item.adults * priceAdult + item.childs * priceChild
    });

    const totalPrice = summaryPrice.reduce((total, num) => total + num, 0);

    const totalPriceEl = document.querySelector('.order__total-price-value');
    totalPriceEl.innerText = `${totalPrice} PLN`;
}

const formEl = document.querySelector('.order');
formEl.addEventListener('submit', checkForm);

function validateName(name) {
    const regex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/;
    return regex.test(name.trim());
}

async function checkForm(e) {
    e.preventDefault();
    const errors = [];
    const name = e.target.elements.name.value;
    const email = e.target.elements.email.value;

    const totalPriceText = document.querySelector('.order__total-price-value').innerText;
    const totalPrice = parseFloat(totalPriceText || 0);

    if(basket.length === 0) errors.push("Please select at least one trip.");
    if (!validateName(name)) {
        errors.push("Name and surname cannot contain numbers or special characters.");   
    }
    if(!name) errors.push("Name and surname are required to place an order.");
    if(!email) {
        errors.push("Email is required to place an order.");
    } else if(!email.includes('@')) {
        errors.push("Where’s the @?");
    };

    if(errors.length > 0) {
        alert(errors.join('\n'));
        return;
    } 

    const orderData = {
        name,
        email,
        basket,
        totalPrice,
        orderDate: new Date().toISOString()
    };

    try {
        await api.addOrder(orderData);
        alert(`Thank you for placing an order worth ${totalPrice}PLN. Order details have been sent to the email address: ${email}.`);
        document.querySelectorAll('.excursions__form').forEach(form => form.reset());
        e.target.reset();
        basket = [];
        renderBasket();
        document.querySelector('.order__total-price-value').innerText = '0 PLN';
    } catch (err) {
        console.error(err);
        alert("An error occurred while placing the order.");
    }
};
