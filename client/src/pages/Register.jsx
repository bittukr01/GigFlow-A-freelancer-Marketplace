import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { register, logoutLocal } from '../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try{
      await dispatch(register({ name, email, password })).unwrap();
      // After registration, require the user to login instead of auto-entering dashboard.
      // Clear any auth state set by the register thunk and send user to login page.
      dispatch(logoutLocal());
      navigate('/login', { state: { created: true } });
    }catch(e){ setErr(e?.message || 'Failed') }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-soft">
        <h2 className="text-2xl font-bold mb-2">Create account</h2>
        <p className="text-sm text-slate-300 mb-6">Join GigFlow to hire and get hired</p>
        {err && <div className="text-red-400 mb-3">{err}</div>}
        <form onSubmit={submit} className="space-y-4">
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/10 focus:border-indigo-400 outline-none" placeholder="Full name" />
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/10 focus:border-indigo-400 outline-none" placeholder="Email" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/10 focus:border-indigo-400 outline-none" placeholder="Password" />
          <button className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500">Create account</button>
        </form>
      </div>
    </div>
  )
}
