/**
 * Cliente JavaScript para API Negocio360
 * Uso: import { ApiClient } from './apiClient.js';
 */

class ApiClient {
  constructor(baseUrl = 'https://localhost:2018/api') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token') || null;
  }

  // Configurar token de autenticación
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Eliminar token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token si existe
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en la petición:', error);
      throw error;
    }
  }

  // ======================
  // AUTENTICACIÓN
  // ======================

  async registro(email, password, datosUsuario = {}) {
    const response = await this.request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ email, password, datos_usuario: datosUsuario }),
    });
    
    if (response.data.session?.access_token) {
      this.setToken(response.data.session.access_token);
    }
    
    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    
    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.clearToken();
    return response;
  }

  // ======================
  // OPERACIONES CRUD
  // ======================

  // Listar registros
  async listar(tabla, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/datos/${tabla}${queryString ? '?' + queryString : ''}`;
    return await this.request(endpoint);
  }

  // Obtener un registro por ID
  async obtener(tabla, id) {
    return await this.request(`/datos/${tabla}/${id}`);
  }

  // Crear un nuevo registro
  async crear(tabla, datos) {
    return await this.request(`/datos/${tabla}`, {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  }

  // Actualizar un registro
  async actualizar(tabla, id, datos) {
    return await this.request(`/datos/${tabla}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  }

  // Eliminar un registro
  async eliminar(tabla, id) {
    return await this.request(`/datos/${tabla}/${id}`, {
      method: 'DELETE',
    });
  }

  // Búsqueda avanzada
  async buscar(tabla, filtros = {}, opciones = {}) {
    return await this.request(`/datos/${tabla}/buscar`, {
      method: 'POST',
      body: JSON.stringify({
        filtros,
        ...opciones,
      }),
    });
  }

  // Health check
  async health() {
    return await this.request('/health');
  }
}

// ======================
// EJEMPLOS DE USO
// ======================

/*
// Crear instancia del cliente
const api = new ApiClient('https://localhost:2018/api');

// --- AUTENTICACIÓN ---

// Registro
await api.registro('usuario@ejemplo.com', 'password123', {
  nombre: 'Juan Pérez',
  rol: 'admin'
});

// Login
await api.login('usuario@ejemplo.com', 'password123');

// Logout
await api.logout();

// --- OPERACIONES CRUD ---

// Listar productos
const productos = await api.listar('productos', {
  limit: 10,
  offset: 0,
  order: 'nombre'
});

// Obtener un producto
const producto = await api.obtener('productos', 1);

// Crear producto
const nuevoProducto = await api.crear('productos', {
  nombre: 'Laptop Dell',
  precio: 1200,
  stock: 10
});

// Actualizar producto
const productoActualizado = await api.actualizar('productos', 1, {
  precio: 1150,
  stock: 8
});

// Eliminar producto
await api.eliminar('productos', 1);

// Búsqueda avanzada
const resultados = await api.buscar('productos', {
  precio: { operador: 'gte', valor: 100 },
  stock: { operador: 'gt', valor: 0 },
  activo: true
}, {
  select: 'id,nombre,precio',
  limit: 20,
  order: 'precio'
});

// Health check
const status = await api.health();
*/

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiClient };
}

// Exportar para uso en navegador
if (typeof window !== 'undefined') {
  window.ApiClient = ApiClient;
}
