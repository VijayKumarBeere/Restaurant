import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getMenu } from './api.js'

export const loadMenu = createAsyncThunk('menu/loadMenu', getMenu)

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
  initialState: { orders: [{ id: 'PL-2048', date: 'Aug 19, 2024', status: 'Delivered', total: 42.75, items: ['Truffle mushroom pizza', 'Green goddess salad', 'Pistachio tiramisu'] }] },
  reducers: {
    placeOrder: (state, action) => {
      state.orders.unshift(action.payload)
    },
  },
})

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions
export const { addMenuItem, updateMenuItem, deleteMenuItem } = menuSlice.actions
export const { placeOrder } = ordersSlice.actions
export const store = configureStore({ reducer: { menu: menuSlice.reducer, cart: cartSlice.reducer, orders: ordersSlice.reducer } })
