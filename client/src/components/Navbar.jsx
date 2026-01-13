import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline'
import api from '../api/axios'
import { logoutLocal } from '../features/auth/authSlice'

export default function Navbar(){
  const user = useSelector(s => s.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef();

  useEffect(()=>{
    const onDoc = (e)=>{ if(menuRef.current && !menuRef.current.contains(e.target)) setMenu(false) }
    document.addEventListener('click', onDoc);
    return ()=> document.removeEventListener('click', onDoc);
  },[])

  const handleLogout = async ()=>{
    try{
      await api.post('/auth/logout');
    }catch(e){}
    dispatch(logoutLocal());
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={()=>navigate('/dashboard')}>
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">GigFlow</div>
            <div className="hidden sm:block text-sm text-slate-400">Marketplace</div>
          </div>

          <div className={`hidden md:flex gap-4 text-sm text-slate-200 ${open? '':' '} `}>
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/gigs" className="hover:text-white">Browse Gigs</Link>
            <Link to="/post" className="hover:text-white">Post a Job</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-md hover:bg-white/5" onClick={()=>setOpen(o=>!o)} aria-label="menu">
            <Bars3Icon className="w-6 h-6 text-slate-200" />
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={()=>setMenu(m=>!m)} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">{user.name[0]||'U'}</div>
                <span className="text-sm text-slate-200">{user.name}</span>
                <ChevronDownIcon className="w-4 h-4 text-slate-300" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900/80 glass p-2 rounded shadow-lg">
                  <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-white/5">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded hover:bg-white/5">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex gap-3">
              <Link to="/login" className="text-sm px-3 py-2 rounded-md bg-white/5 hover:bg-white/10">Login</Link>
              <Link to="/register" className="text-sm px-3 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500">Sign up</Link>
            </div>
          )}
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col gap-2 text-slate-200">
            <Link to="/dashboard" onClick={()=>setOpen(false)}>Dashboard</Link>
            <Link to="/gigs" onClick={()=>setOpen(false)}>Browse Gigs</Link>
            <Link to="/post" onClick={()=>setOpen(false)}>Post a Job</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
