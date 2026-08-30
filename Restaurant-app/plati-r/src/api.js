const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5177/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = response.status === 204
    ? null
    : await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || `API request failed (${response.status})`)
  }

  return data
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerAdmin(payload) {
  return request('/auth/admin/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginAdmin(payload) {
  return request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getMenu() {
  return request('/menu')
}

export function createMenuItem(item, token) {
  return request('/menu', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(item),
  })
}

export function updateMenuItemApi(id, item, token) {
  return request(`/menu/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(item),
  })
}

export function deleteMenuItemApi(id, token) {
  return request(`/menu/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function placeOrderApi(order, token) {
  return request('/orders', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(order),
  })
}



