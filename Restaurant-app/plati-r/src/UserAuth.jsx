import { useState } from 'react'
import { Check, LockKeyhole, X } from 'lucide-react'
import { loginUser, registerUser } from './api.js'

function UserAuth({ mode, onClose, onAuthenticated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isSignup = mode === 'signup'
  const update = (field, value) => setForm({ ...form, [field]: value })

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = isSignup
        ? await registerUser(form)
        : await loginUser({ email: form.email, password: form.password })

      sessionStorage.setItem('user', JSON.stringify(user))
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return <div className="auth-overlay"><section className="auth-card auth-success"><div className="admin-lock"><Check size={24} /></div><h2>{isSignup ? 'Welcome to PlatiR.' : 'Welcome back.'}</h2><p>{isSignup ? 'Your account is ready. Let’s find something delicious.' : 'You are now signed in to your PlatiR account.'}</p><button className="primary-button" onClick={() => { onAuthenticated(); onClose() }}>Continue browsing</button></section></div>

  return <div className="auth-overlay" onClick={onClose}><section className="auth-card" onClick={(event) => event.stopPropagation()}><button className="auth-close" onClick={onClose} aria-label="Close"><X size={19} /></button><div className="auth-icon"><LockKeyhole size={21} /></div><p className="eyebrow">PLATIR ACCOUNT</p><h2>{isSignup ? 'Create your account.' : 'Welcome back.'}</h2><p className="auth-copy">{isSignup ? 'Save your favorites and keep every order in one place.' : 'Sign in to see your orders and check out faster.'}</p><form className="auth-form" onSubmit={submit}>{isSignup && <label>Full name<input required value={form.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" /></label><label>Password<input required type="password" minLength="6" value={form.password} onChange={(event) => update('password', event.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} /></label>{error && <small className="form-error">{error}</small>}<button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}</button></form></section></div>
}

export default UserAuth
