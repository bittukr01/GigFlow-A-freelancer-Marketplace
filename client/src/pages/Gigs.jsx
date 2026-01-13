import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGigs } from '../features/gig/gigSlice'
import { Link } from 'react-router-dom'

export default function Gigs(){
  const dispatch = useDispatch();
  const gigs = useSelector(s => s.gigs.list);
  const [search, setSearch] = useState('');

  useEffect(()=>{ dispatch(fetchGigs(search)) }, [dispatch, search]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search gigs..." className="flex-1 p-3 rounded-lg bg-white/5 outline-none border border-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gigs.map(g => (
          <Link to={`/gigs/${g._id}`} key={g._id} className="block glass p-4 rounded-2xl shadow-soft hover:scale-[1.01] transition card-3d">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{g.title}</h3>
              <div className="text-sm bg-white/5 px-2 py-1 rounded">${g.budget}</div>
            </div>
            <p className="text-slate-300 mt-2">{g.description.slice(0,120)}...</p>
            <div className="mt-3">
              <span className={`px-2 py-1 rounded text-xs ${g.status==='Open'?'bg-green-600':'bg-indigo-600'}`}>{g.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
