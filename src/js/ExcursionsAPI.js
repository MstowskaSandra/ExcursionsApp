class ExcursionsAPI {

    constructor() { 
        this.apiUrlAdmin = 'http://localhost:3000/excursions';
        this.apiUrlClient = 'http://localhost:3000/orders';
    }

    loadExcursionsAdmin() { 
        return fetch(this.apiUrlAdmin)
            .then(resp => {
                if(resp.ok) { return resp.json(); }
                return Promise.reject(resp);
            })
    }

    addExcursions(data) {
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        };

        return fetch(this.apiUrlAdmin, options)
            .then(resp => {
                if (!resp.ok) throw new Error('Błąd podczas dodawania');
                return resp.json();
            })
    }

    removeExcursions(id) {
        const options = { method: 'DELETE' };

        fetch(`${this.apiUrlAdmin}/${id}`, options)
            .then(resp => console.log(resp))
            .then(() => {
                this.loadExcursionsAdmin();
            })
            .catch(err => console.error(err));
    };

    updateExcursions(id, data) {
        const options = {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        };

        fetch(`${this.apiUrlAdmin}/${id}`, options)
            .then(resp => resp.json());
    }

    loadExcursionsClient() {
        return fetch(this.apiUrlAdmin)
            .then(resp => {
                if(resp.ok) { return resp.json(); }
                return Promise.reject(resp);
            });
    }

    addOrder(orderData) {
        const options = {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: { 'Content-Type': 'application/json' }
        };

        return fetch(this.apiUrlClient, options)
            .then(resp => {
                if (!resp.ok) throw new Error('Błąd podczas dodawania');
                return resp.json();
            })
            .then(data => {
                console.log("Dodano:", data);
            })
            .catch(err => console.error(err));
    }

    loadOrders() {
        return fetch(this.apiUrlClient)
            .then(resp => {
                if (resp.ok) return resp.json();
                throw new Error('Błąd pobierania zamówień');
            });
    }
}

export default ExcursionsAPI;