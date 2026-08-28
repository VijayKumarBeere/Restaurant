import { configureStore, createSlice } from '@reduxjs/toolkit'

export const menuItems = [
  { id: 1, name: 'Truffle mushroom pizza', category: 'Pizza', description: 'Wild mushrooms, truffle oil, mozzarella', price: 18.5, rating: 4.9, time: '25-30 min', image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85', tag: 'Popular' },
  { id: 2, name: 'Spicy honey pepperoni', category: 'Pizza', description: 'Cupped pepperoni, hot honey, basil', price: 16.9, rating: 4.8, time: '20-25 min', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=85', tag: 'Best seller' },
  { id: 3, name: 'Crispy chicken bao', category: 'Asian', description: 'Pickled cucumber, sesame, hoisin glaze', price: 13.5, rating: 4.7, time: '15-20 min', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=85', tag: 'New' },
  { id: 4, name: 'Salmon poke bowl', category: 'Healthy', description: 'Sushi rice, avocado, edamame, ponzu', price: 17.25, rating: 4.9, time: '15-20 min', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', tag: 'Fresh' },
  { id: 5, name: 'Green goddess salad', category: 'Healthy', description: 'Avocado, greens, seeds, lemon dressing', price: 12.75, rating: 4.6, time: '10-15 min', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85', tag: 'Light' },
  { id: 6, name: 'Smash burger deluxe', category: 'Burgers', description: 'Double patty, aged cheddar, house sauce', price: 15.5, rating: 4.8, time: '20-25 min', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85', tag: 'Popular' },
  { id: 7, name: 'Miso caramel ramen', category: 'Asian', description: 'Tonkotsu broth, noodles, egg, corn', price: 16.25, rating: 4.7, time: '20-25 min', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85', tag: 'Comfort' },
  { id: 8, name: 'Pistachio tiramisu', category: 'Desserts', description: 'Mascarpone, espresso, roasted pistachio', price: 8.5, rating: 4.9, time: '10-15 min', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85', tag: 'Sweet' },
]

const menuSlice = createSlice({
  name: 'menu',
  initialState: { items: menuItems },
  reducers: {
    addMenuItem: (state, action) => { state.items.push({ ...action.payload, id: Date.now() }) },
    updateMenuItem: (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    deleteMenuItem: (state, action) => { state.items = state.items.filter((item) => item.id !== action.payload) },
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
