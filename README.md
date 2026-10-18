# Programación III — CRUD Pattern

A reusable template for building CRUD exercises with HTML, Bootstrap, and vanilla JavaScript.

## Project structure

```text
project/
├── index.html
├── css/
│   └── estilos.css
└── js/
    └── manejadora.js
```

## 1. HTML: define the structure

The HTML contains the interface and the IDs that JavaScript will use to access elements.

Typical elements:

- A `<table>` with a `<tbody id="data_table">` to display records.
- A `<form>` to create or edit a record.
- An `<input type="hidden">` to store the ID of the record being edited.
- A notification container to display success and error messages.
- A script reference using `defer`.

```html
<script src="./js/manejadora.js" defer></script>
```

**Remember:** HTML defines the structure; JavaScript handles the behavior.

## 2. JavaScript: the handler class

Create a class responsible for communication with the API and manipulation of the table.

```javascript
class EntidadHandler {
    constructor(url = 'https://api.example.com') {
        this.apiURL = url.replace(/\/+$/, '')
    }
}
```

### Centralize HTTP requests

Use one generic method to avoid repeating the same `fetch()` configuration.

```javascript
async handler(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            Accept: 'application/json',
        },
    }

    if (data !== null) {
        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(data)
    }

    const response = await fetch(
        `${this.apiURL}${endpoint}`,
        options
    )

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    if (response.status === 204) {
        return null
    }

    return await response.json()
}
```

### CRUD methods

Each method calls the generic handler with the appropriate HTTP method and endpoint.

| Operation | HTTP method | Example |
|---|---|---|
| List records | GET | `/users` |
| Get one record | GET | `/users/1` |
| Create | POST | `/users` |
| Update | PUT | `/users/1` |
| Delete | DELETE | `/users/1` |

```javascript
async getEntidades() {
    return await this.handler('/users')
}

async getEntidadById(id) {
    return await this.handler(`/users/${id}`)
}

async createEntidad(data) {
    return await this.handler('/users', 'POST', data)
}

async editEntidad(id, data) {
    return await this.handler(`/users/${id}`, 'PUT', data)
}

async deleteEntidad(id) {
    return await this.handler(`/users/${id}`, 'DELETE')
}
```

Adapt the endpoint, property names, and HTTP methods to the API specified in the exercise.

## 3. Render records in the table

The `placeData()` method receives an array and creates one row for each record.

```javascript
placeData(entidades) {
    const tabla = document.getElementById('data_table')
    tabla.replaceChildren()

    entidades.forEach((entidad) => {
        const fila = document.createElement('tr')

        // Create cells and buttons here.

        tabla.append(fila)
    })
}
```

Use `textContent` or DOM methods to insert untrusted API values safely. If using `innerHTML`, escape dynamic values first.

## 4. DOMContentLoaded: initialize the application

Put event listeners and the initial data load inside this event.

```javascript
const entidades = new EntidadHandler()

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get the HTML elements.
    // 2. Define cargarEntidades().
    // 3. Add the form submit listener.
    // 4. Add the table click listener.
    // 5. Add the form reset listener.
    // 6. Load the initial records.

    await cargarEntidades()
})

