import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createGig, fetchGigs } from '../features/gig/gigSlice'
import { useNavigate } from 'react-router-dom'

export default function PostJob(){
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s=>s.auth.user);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if(!user) return setError('You must be logged in to post a job');
    try{
      const res = await dispatch(createGig({ title, description, budget: Number(budget) })).unwrap();
      await dispatch(fetchGigs()).unwrap();
      navigate(`/gigs/${res._id}`);
    }catch(err){ setError(err?.message || 'Failed to post job') }
  }

  return (
    <div className="max-w-2xl mx-auto glass p-6 rounded-2xl shadow-soft">
      <h2 className="text-2xl font-bold mb-3">Post a Job</h2>
      {error && <div className="text-red-400 mb-3">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-3 rounded bg-transparent border border-white/10" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full p-3 rounded bg-transparent border border-white/10" rows={6} />
        <input value={budget} onChange={e=>setBudget(e.target.value)} placeholder="Budget" className="w-1/3 p-3 rounded bg-transparent border border-white/10" />
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-500">Post Job</button>
          <button type="button" onClick={()=>{ setTitle(''); setDescription(''); setBudget('') }} className="px-4 py-2 rounded bg-white/5">Reset</button>
        </div>
      </form>
    </div>
  )
}
