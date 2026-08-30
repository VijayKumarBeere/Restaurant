import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getMenu } from './api.js'

const normalizeOrder = (order) => ({
  id: order?.id ?? order?.Id,
  orderNumber: order?.orderNumber ?? order?.OrderNumber ?? 'N/A',
  date: order?.createdAt || order?.CreatedAt
    ? new Date(order?.createdAt ?? order?.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Today',
  status: order?.status ?? order?.Status ?? 'Preparing',
  total: Number(order?.total ?? order?.Total ?? 0),
  items: (order?.items ?? order?.Items ?? []).map((item) => item?.itemName ?? item?.ItemName ?? item?.name ?? item?.Name ?? 'Item'),
})

export const loadMenu = createAsyncThunk('menu/loadMenu', getMenu)
export const loadOrders = createAsyncThunk('orders/loadOrders', async () => {
  const token = JSON.parse(sessionStorage.getItem('user') || '{}').token
  if (!token) throw new Error('User is not authenticated')
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5177/api'}/orders`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Failed to load orders')
  const orders = await response.json()
  return orders.map(normalizeOrder)
})
const menuSlice = createSlice({
  name: 'menu',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    addMenuItem: (state, action) => { state.items.push(action.payload) },
    updateMenuItem: (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    deleteMenuItem: (state, action) => { state.items = state.items.filter((item) => item.id !== action.payload) },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMenu.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(loadMenu.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload })
      .addCase(loadMenu.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message })
  },
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((item) => item.id === action.payload.id)
      if (existing) existing.quantity += 1
      else state.items.push({ ...action.payload, quantity: 1 })
    },
    removeFromCart: (state, action) => {
      const existing = state.items.find((item) => item.id === action.payload)
      if (!existing) return
      if (existing.quantity === 1) state.items = state.items.filter((item) => item.id !== action.payload)
      else existing.quantity -= 1
    },
    clearCart: (state) => { state.items = [] },
  },
})

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], status: 'idle', error: null },
  reducers: {
    placeOrder: (state, action) => {
      state.orders.unshift(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(loadOrders.fulfilled, (state, action) => { state.status = 'succeeded'; state.orders = action.payload })
      .addCase(loadOrders.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message })
  },
})

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions
export const { addMenuItem, updateMenuItem, deleteMenuItem } = menuSlice.actions
export const { placeOrder, getOrders } = ordersSlice.actions
export const store = configureStore({ reducer: { menu: menuSlice.reducer, cart: cartSlice.reducer, orders: ordersSlice.reducer } })
