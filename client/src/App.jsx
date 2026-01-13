import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import SocketClient from './components/SocketClient'
import Dashboard from './pages/Dashboard'
import Gigs from './pages/Gigs'
import GigDetails from './pages/GigDetails'
import PostJob from './pages/PostJob'
import Login from './pages/Login'
import Register from './pages/Register'
import { useDispatch } from 'react-redux'
import { fetchMe } from './features/auth/authSlice'

export default function App(){
  const dispatch = useDispatch();
  useEffect(()=>{ dispatch(fetchMe()) }, [dispatch]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <SocketClient />
      <main className="p-6 md:p-10">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/gigs/:id" element={<GigDetails />} />
          <Route path="/post" element={<PostJob />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
