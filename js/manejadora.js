
class EntidadHandler {
    constructor(url = 'https://jsonplaceholder.typicode.com') {
        this.apiURL = url.replace(/\/+$/, '')
    }

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

        const loading = document.getElementById('loading')

        try {
            loading?.classList.remove('d-none')

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
        } finally {
            loading?.classList.add('d-none')
        }
    }

    async getEntidades() {
        return await this.handler('/users')
    }

    async getEntidadById(id) {
        return await this.handler(`/users/${id}`)
    }

    async createEntidad(entidad) {
        return await this.handler('/users', 'POST', entidad)
    }

    async editEntidad(id, entidad) {
        return await this.handler(`/users/${id}`, 'PUT', entidad)
    }

    async deleteEntidad(id) {
        return await this.handler(`/users/${id}`, 'DELETE')
    }

    placeData(entidades) {
        const tabla = document.getElementById('data_table')

        tabla.replaceChildren()

        entidades.forEach((entidad) => {
            const fila = document.createElement('tr')

            fila.innerHTML = `
                <td>${entidad.id}</td>
                <td>${this.escapeHTML(entidad.name)}</td>
                <td>
                    <button
                        type="button"
                        class="btn btn-sm btn-primary"
                        data-action="edit"
                        data-id="${entidad.id}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        data-action="delete"
                        data-id="${entidad.id}"
                    >
                        Eliminar
                    </button>
                </td>
            `

            tabla.append(fila)
        })
    }

    escapeHTML(value) {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }

        return String(value ?? '').replace(
            /[&<>"']/g,
            (character) => entities[character]
        )
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notifications')
        const toast = document.createElement('div')

        toast.className = `toast show text-bg-${type} border-0`
        toast.setAttribute('role', 'status')

        const body = document.createElement('div')
        body.className = 'toast-body'
        body.textContent = message

        container.append(toast)
        toast.append(body)

        setTimeout(() => toast.remove(), 5000)
    }
}

const entidades = new EntidadHandler()

document.addEventListener('DOMContentLoaded', async () => {
    const tabla = document.getElementById('data_table')
    const formulario = document.getElementById('form_entidad')

    let lista = []

    // READ: cargar listado
    async function cargarEntidades() {
        try {
            lista = await entidades.getEntidades()
            entidades.placeData(lista)
        } catch (error) {
            console.error(error)
            entidades.showNotification(
                'Error al cargar los datos.',
                'danger'
            )
        }
    }

    // CREATE / UPDATE: procesar formulario
    formulario.addEventListener('submit', async (event) => {
        event.preventDefault()

        if (!formulario.checkValidity()) {
            formulario.reportValidity()
            return
        }

        const datos = Object.fromEntries(new FormData(formulario))
        const id = datos.id

        delete datos.id
        datos.name = datos.name.trim()

        const boton = document.getElementById('submit-button')
        boton.disabled = true

        try {
            if (id) {
                await entidades.editEntidad(id, datos)

                entidades.showNotification(
                    'Registro actualizado correctamente.'
                )
            } else {
                await entidades.createEntidad(datos)

                entidades.showNotification(
                    'Registro creado correctamente.'
                )
            }

            formulario.reset()
            document.getElementById('entidad_id').value = ''

            await cargarEntidades()
        } catch (error) {
            console.error(error)
            entidades.showNotification(
                'Error al guardar el registro.',
                'danger'
            )
        } finally {
            boton.disabled = false
        }
    })

    // EDIT / DELETE: delegación de eventos
    tabla.addEventListener('click', async (event) => {
        const boton = event.target.closest('button[data-action]')

        if (!boton || !tabla.contains(boton)) {
            return
        }

        const { action, id } = boton.dataset

        try {
            if (action === 'edit') {
                const entidad = await entidades.getEntidadById(id)

                document.getElementById('entidad_id').value = entidad.id
                document.getElementById('nombre').value = entidad.name

                document.getElementById('form-title').textContent =
                    'Editar [entidad]'

                document.getElementById('submit-button').textContent =
                    'Guardar cambios'
            }

            if (action === 'delete') {
                if (!confirm('¿Deseás eliminar este registro?')) {
                    return
                }

                await entidades.deleteEntidad(id)

                entidades.showNotification(
                    'Registro eliminado correctamente.'
                )

                await cargarEntidades()
            }
        } catch (error) {
            console.error(error)
            entidades.showNotification(
                'Error al procesar la operación.',
                'danger'
            )
        }
    })

    // Reset del formulario
    formulario.addEventListener('reset', () => {
        document.getElementById('entidad_id').value = ''

        document.getElementById('form-title').textContent =
            'Agregar [entidad]'

        document.getElementById('submit-button').textContent =
            'Agregar [entidad]'
    })

    await cargarEntidades()
})

