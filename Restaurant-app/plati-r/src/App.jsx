import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, clearCart, loadMenu, loadOrders, placeOrder, removeFromCart } from './store.js'
import AdminPage from './AdminPage.jsx'
import UserAuth from './UserAuth.jsx'
import { ArrowRight, Bike, Check, ChevronDown, Clock3, MapPin, Minus, Package, Plus, Search, ShoppingBag, Star, X } from 'lucide-react'
import './App.css'
import { placeOrderApi } from './api.js'

function FoodCard({ item, cartItem, onAdd, onRemove, onViewCart }) {
  const quantity = cartItem?.quantity || 0

  return (
    <article className={`food-card ${quantity ? 'is-added' : ''}`}>
      <div className="food-image">
        <img src={item.image} alt={item.name} />
        <span>{item.tag}</span>
        <button aria-label={`Add ${item.name} to cart`} onClick={() => onAdd(item)}><Plus size={20} /></button>
      </div>
      <div className="food-content">
        <div className="food-title"><h3>{item.name}</h3><b>${item.price.toFixed(2)}</b></div>
        <p>{item.description}</p>
        <div className="food-details"><span><Star size={14} fill="currentColor" /> {item.rating}</span><span><Clock3 size={14} /> {item.time}</span></div>
        {quantity > 0 && <div className="card-cart-status"><span><Check size={14} /> In your cart · {quantity}</span><div><button onClick={() => onRemove(item.id)} aria-label={`Remove one ${item.name}`}><Minus size={13} /></button><button onClick={() => onAdd(item)} aria-label={`Add another ${item.name}`}><Plus size={13} /></button></div></div>}
        {quantity > 0 && <button className="view-cart-button" onClick={onViewCart}>View cart <ArrowRight size={14} /></button>}
      </div>
    </article>
  )
}

function UserApp() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.items)
  const menu = useSelector((state) => state.menu.items)
  const menuStatus = useSelector((state) => state.menu.status)
  const orders = useSelector((state) => state.orders.orders)
  const [view, setView] = useState('menu')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(null)
  const [address, setAddress] = useState({ name: '', street: '', city: '', postalCode: '', phone: '' })
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' })
  const [authMode, setAuthMode] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!JSON.parse(sessionStorage.getItem('user') || 'null'))
  const categories = ['All', 'Pizza', 'Burgers', 'Asian', 'Healthy', 'Desserts']
  const filteredItems = menu.filter((item) => (category === 'All' || item.category === category) && item.name.toLowerCase().includes(search.toLowerCase()))
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const findCartItem = (id) => cartItems.find((item) => item.id === id)

  useEffect(() => {
    if (menuStatus === 'idle') dispatch(loadMenu())
  }, [dispatch, menuStatus])

  useEffect(() => {
    if (isLoggedIn) dispatch(loadOrders())
  }, [dispatch, isLoggedIn])

  const handleOpenOrders = async () => {
    if (isLoggedIn) {
      await dispatch(loadOrders())
      console.log('Orders loaded:', orders)
    }
    setView('orders')
  }

  const updateAddress = (field, value) => setAddress({ ...address, [field]: value })
  const updatePayment = (field, value) => setPayment({ ...payment, [field]: value })

  const checkout = async () => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null')
    const token = storedUser?.token

    const orderPayload = {
      items: cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      })),
      deliveryName: address.name,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      phone: address.phone,
      paymentReference: payment.cardNumber ? `card_${payment.cardNumber.replace(/\D/g, '').slice(-4)}` : 'offline',
    }

    try {
      await placeOrderApi(orderPayload, token)
      await dispatch(loadOrders())
      dispatch(clearCart())
      setCartOpen(false)
      setCheckoutStep(null)
      setView('menu')
      setOrdered(true)
    } catch (error) {
      console.error('Order placement failed:', error)
      setCartOpen(false)
      setCheckoutStep(null)
      setView('menu')
      setOrdered(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('menu')}>
          <span className="brand-mark">P</span>
          <span>Plati<span>R</span></span>
        </button>
        {isLoggedIn && 
          <nav><button className={view === 'menu' ? 'active' : ''} onClick={() => setView('menu')}>Discover</button>
          <button className={view === 'orders' ? 'active' : ''} onClick={handleOpenOrders}>Past orders</button>
          </nav>
        }
        <div className="header-actions">
          <div className="location">
            <MapPin size={16} /><span>Delivering to <b>Home</b></span>
            <ChevronDown size={14} />
          </div>
          {!isLoggedIn && 
            <>
              <button className="account-button" onClick={() => setAuthMode('login')}>Log in</button>
              <button className="signup-button" onClick={() => setAuthMode('signup')}>Sign up</button>
            </>
          }
          {isLoggedIn && <button className="account-button" onClick={() => { 
            sessionStorage.removeItem('user')
            setView('menu');
            setIsLoggedIn(false) 
          }}>Log out</button>}
          {isLoggedIn && 
            <button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={19} /> 
              <span>Cart</span>{cartCount > 0 && <strong>{cartCount}</strong>}
            </button>
          }
        </div>
      </header>
      
      {view === 'menu' ? 
        <main>
          <section className="hero">
            <div>
              <p className="eyebrow">GOOD FOOD, GOOD MOOD</p>
              <h1>Your next favorite<br /><em>meal</em> is here.</h1>
              <p className="hero-copy">From local gems to kitchen classics, delivered warm and ready for your table.</p>
              <div className="hero-meta">
                <span><Bike size={17} /> Avg. 25 min</span>
                <span><Star size={16} fill="currentColor" /> 4.8 average rating</span>
              </div>
            </div>
            <div className="hero-visual">
              <img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1100&q=85" alt="A plate of dumplings" />
              <div className="floating-note">
                <span className="note-icon"><Check size={16} /></span>
                <div><b>Freshly made</b><small>in kitchens near you</small></div>
              </div>
            </div>
          </section>
          {isLoggedIn ? 
            <section className="menu-section">
              <div className="section-heading">
                <div><p className="eyebrow">EXPLORE THE MENU</p><h2>What are you craving?</h2></div>
                <div className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes" /></div>
              </div>
              <div className="category-row">
                {categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}
              </div>
              <div className="food-grid">
                {filteredItems.map((item) => <FoodCard key={item.id} item={item} cartItem={findCartItem(item.id)} onAdd={(food) => dispatch(addToCart(food))} onRemove={(id) => dispatch(removeFromCart(id))} onViewCart={() => setCartOpen(true)} />)}
              </div>
            </section>
             : 
            <section className="login-prompt">
              <p className="eyebrow">YOUR TABLE IS WAITING</p>
              <h2>Log in to explore the menu.</h2>
              <p>Sign in or create an account to browse dishes, add items to your cart, and place an order.</p>
              <button className="primary-button" onClick={() => setAuthMode('login')}>Log in to continue <ArrowRight size={17} /></button>
            </section>
          }
        </main> 
        : 
        <main className="orders-page">
          <p className="eyebrow">YOUR PLATI R</p>
          <h1>Past orders</h1>
          <p className="page-intro">A little history of the good stuff.</p>
          <div className="order-list">
            {orders.length === 0 ? (
              <div className="empty-cart">
                <Package size={32} />
                <p>No past orders yet.</p>
              </div>
            ) : orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-icon"><Package size={21} /></div>
                <div className="order-info">
                  <div><b>Order {order.orderNumber}</b>
                    <span>{order.date}</span>
                  </div>
                  <p>{(order.items || []).join(' · ') || 'No items recorded'}</p>
                </div>
                <div className="order-total">
                  <span className={`status ${String(order.status).toLowerCase()}`}>{order.status}</span>
                  <b>${Number(order.total || 0).toFixed(2)}</b>
                </div>
                <button className="reorder" onClick={() => { setView('menu'); setOrdered(false) }}>Order again <ArrowRight size={16} /></button>
              </article>
            ))}
          </div>
        </main>
      }
      <footer>
        <span>PlatiR</span>
        <span>Made for hungry people, everywhere.</span>
        <span>© 2024 PlatiR</span>
      </footer>
      {ordered && <div className="toast"><Check size={18} /> Order received. Your kitchen is on it.</div>}
      {cartOpen && 
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <p className="eyebrow">YOUR BAG</p>
                <h2>Ready when you are.</h2>
              </div>
              <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button>
            </div>
            {cartItems.length === 0 ? 
              <div className="empty-cart"><ShoppingBag size={32} />
                <p>Your bag is waiting for something delicious.</p>
                <button className="primary-button" onClick={() => setCartOpen(false)}>Browse menu</button>
              </div> 
              : 
              <>
                <div className="cart-list">
                  {cartItems.map((item) => 
                  <div className="cart-row" key={item.id}>
                    <img src={item.image} alt="" />
                    <div>
                      <b>{item.name}</b>
                      <small>${item.price.toFixed(2)}</small>
                    </div>
                    <div className="quantity">
                      <button onClick={() => dispatch(removeFromCart(item.id))} aria-label="Decrease quantity"><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => dispatch(addToCart(item))} aria-label="Increase quantity"><Plus size={14} /></button>
                    </div>
                  </div>)}
                </div>
                <div className="checkout">
                  <div><span>Subtotal</span><b>${subtotal.toFixed(2)}</b></div>
                  <div><span>Delivery</span><b>$2.50</b></div>
                  <div className="checkout-total"><span>Total</span><b>${(subtotal + 2.5).toFixed(2)}</b></div>
                  <button className="primary-button" onClick={() => setCheckoutStep('address')}>Continue to address <ArrowRight size={17} /></button>
                </div>
              </>
            }
          </aside>
        </div>
      }
      {checkoutStep && 
        <div className="overlay checkout-overlay">
          <section className="checkout-panel">
            <div className="checkout-top">
              <div><p className="eyebrow">CHECKOUT · STEP {checkoutStep === 'address' ? '1' : '2'} OF 2</p>
                <h2>{checkoutStep === 'address' ? 'Where should we deliver?' : 'How would you like to pay?'}</h2>
              </div>
              <button className="icon-button" onClick={() => setCheckoutStep(null)} aria-label="Close checkout"><X size={20} /></button>
            </div>
            <div className="step-indicator">
              <span className="done"><Check size={13} /> Address</span><i></i>
              <span className={checkoutStep === 'payment' ? 'done' : ''}>{checkoutStep === 'payment' && <Check size={13} />} Payment</span>
            </div>
            {checkoutStep === 'address' ? 
              <form className="checkout-form" onSubmit={(event) => { event.preventDefault(); setCheckoutStep('payment') }}>
                <label>Full name<input required value={address.name} onChange={(event) => updateAddress('name', event.target.value)} placeholder="Alex Morgan" /></label>
                <label>Street address<input required value={address.street} onChange={(event) => updateAddress('street', event.target.value)} placeholder="24 Garden Street" /></label>
                <div className="form-row">
                  <label>City<input required value={address.city} onChange={(event) => updateAddress('city', event.target.value)} placeholder="Brooklyn" /></label>
                  <label>Postal code<input required value={address.postalCode} onChange={(event) => updateAddress('postalCode', event.target.value)} placeholder="11211" /></label>
                </div>
                <label>Phone number<input required type="tel" value={address.phone} onChange={(event) => updateAddress('phone', event.target.value)} placeholder="(555) 123-4567" /></label>
                <button className="primary-button" type="submit">Continue to payment <ArrowRight size={17} /></button>
              </form> 
              : 
              <form className="checkout-form" onSubmit={(event) => { event.preventDefault(); checkout() }}>
                <div className="payment-card">
                  <div className="card-chip"></div>
                  <span>VISA</span>
                  <b>•••• •••• •••• {payment.cardNumber.slice(-4) || '4242'}</b>
                </div>
                <label>Name on card<input required value={payment.cardName} onChange={(event) => updatePayment('cardName', event.target.value)} placeholder="Alex Morgan" /></label>
                <label>Card number<input required inputMode="numeric" pattern="[0-9 ]{12,19}" value={payment.cardNumber} onChange={(event) => updatePayment('cardNumber', event.target.value)} placeholder="4242 4242 4242 4242" /></label>
                <div className="form-row">
                  <label>Expiry date<input required value={payment.expiry} onChange={(event) => updatePayment('expiry', event.target.value)} placeholder="MM / YY" /></label>
                  <label>CVV<input required type="password" inputMode="numeric" maxLength="4" value={payment.cvv} onChange={(event) => updatePayment('cvv', event.target.value)} placeholder="•••" /></label>
                </div>
                <button className="primary-button" type="submit">Pay ${(subtotal + 2.5).toFixed(2)} <ArrowRight size={17} /></button>
                <small className="secure-note"><Check size={14} /> Secure payment, powered by PlatiR</small>
              </form>
            }
          </section>
        </div>
      }
      {authMode && <UserAuth mode={authMode} onClose={() => setAuthMode(null)} onAuthenticated={() => setIsLoggedIn(true)} />}
    </div>
  )
}

function App() {
  if (window.location.pathname === '/admin') return <AdminPage onExit={() => { window.location.href = '/' }} />
  return <UserApp />
}

export default App
