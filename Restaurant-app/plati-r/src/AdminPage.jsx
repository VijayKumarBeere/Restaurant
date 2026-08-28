import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Edit3, LockKeyhole, Plus, Save, Trash2, X } from 'lucide-react'
import { addMenuItem, deleteMenuItem, updateMenuItem } from './store.js'

const emptyItem = { name: '', category: 'Pizza', description: '', price: '', rating: '4.8', time: '20-25 min', image: '', tag: 'New' }
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'platiR2024'

function AdminPage({ onExit }) {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.menu.items)
  const [authenticated, setAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [credentials, setCredentials] = useState({ username: '', password: '', email: '' })
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(emptyItem)

  const submitAuth = (event) => {
    event.preventDefault()
    if (authMode === 'signup') {
      setAuthenticated(true)
      setError('')
    } else if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
    } else setError('Invalid username or password.')
  }

  const save = (event) => {
    event.preventDefault()
    const item = { ...draft, price: Number(draft.price), rating: Number(draft.rating) }
    if (editing === 'new') dispatch(addMenuItem(item))
    else dispatch(updateMenuItem(item))
    setEditing(null)
    setDraft(emptyItem)
  }

  if (!authenticated) return <main className="admin-login"><button className="admin-exit" onClick={onExit}><ArrowLeft size={16} /> Back to PlatiR</button><div className="login-card"><div className="admin-lock"><LockKeyhole size={24} /></div><p className="eyebrow">PLATIR ADMIN</p><h1>{authMode === 'login' ? 'Manage your menu.' : 'Create admin access.'}</h1><p>{authMode === 'login' ? 'Sign in to add, update, or remove dishes.' : 'Register an administrator account to manage dishes.'}</p><form onSubmit={submitAuth} className="admin-form">{authMode === 'signup' && <label>Email<input required type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label>}<label>Username<input required value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} autoComplete="username" /></label><label>Password<input required type="password" minLength="6" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} /></label>{error && <small className="form-error">{error}</small>}<button className="primary-button" type="submit">{authMode === 'login' ? 'Sign in' : 'Sign up'}</button></form><button className="auth-switch" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError('') }}>{authMode === 'login' ? 'Need admin access? Sign up' : 'Already registered? Sign in'}</button></div></main>

  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">PLATIR ADMIN</p><h1>Menu items</h1><p>Keep your customer menu fresh and up to date.</p></div><div className="admin-actions"><button className="secondary-button" onClick={onExit}><ArrowLeft size={15} /> User view</button><button className="primary-button add-item" onClick={() => { setDraft(emptyItem); setEditing('new') }}><Plus size={16} /> Add item</button></div></header><section className="admin-table"><div className="admin-table-head"><span>Dish</span><span>Category</span><span>Price</span><span>Actions</span></div>{items.map((item) => <div className="admin-row" key={item.id}><div className="admin-dish"><img src={item.image} alt="" /><div><b>{item.name}</b><small>{item.description}</small></div></div><span>{item.category}</span><b>${item.price.toFixed(2)}</b><div className="row-actions"><button aria-label={`Edit ${item.name}`} onClick={() => { setDraft(item); setEditing(item.id) }}><Edit3 size={16} /></button><button aria-label={`Delete ${item.name}`} onClick={() => dispatch(deleteMenuItem(item.id))}><Trash2 size={16} /></button></div></div>)}</section>{editing && <div className="admin-modal"><form className="item-form" onSubmit={save}><div className="modal-heading"><h2>{editing === 'new' ? 'Add menu item' : 'Edit menu item'}</h2><button type="button" onClick={() => setEditing(null)} aria-label="Close"><X size={19} /></button></div>{['name', 'description', 'image'].map((field) => <label key={field}>{field === 'name' ? 'Dish name' : field === 'image' ? 'Image URL' : 'Description'}<input required value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} placeholder={field === 'image' ? 'https://...' : ''} /></label>)}<div className="form-row"><label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{['Pizza', 'Burgers', 'Asian', 'Healthy', 'Desserts'].map((category) => <option key={category}>{category}</option>)}</select></label><label>Price<input required type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} /></label></div><div className="form-row"><label>Rating<input required type="number" min="0" max="5" step="0.1" value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: event.target.value })} /></label><label>Delivery time<input required value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label></div><button className="primary-button" type="submit"><Save size={16} /> Save item</button></form></div>}</main>
}

export default AdminPage
