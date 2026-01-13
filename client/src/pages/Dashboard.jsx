import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchGigs } from '../features/gig/gigSlice'
import api from '../api/axios'
import { fetchMyCounts } from '../features/bid/bidSlice'

export default function Dashboard(){
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const authStatus = useSelector(s => s.auth.status);
  const navigate = useNavigate();
  const gigs = useSelector(s => s.gigs.list);

  useEffect(()=>{ dispatch(fetchGigs()) }, [dispatch]);

  const totalGigs = gigs.filter(g => {
    if (!user) return false;
    const owner = g.owner;
    const ownerId = owner
      ? (owner._id ? owner._id.toString() : (typeof owner === 'string' ? owner : owner.toString()))
      : null;
    const userId = user.id || user._id;
    return ownerId && userId && ownerId === userId.toString();
  }).length || 0;

  // use central counts from bids slice so socket updates refresh this
  const { totalBids, hiredJobs } = useSelector(s => s.bids.counts || { totalBids: 0, hiredJobs: 0 });

  useEffect(()=>{ if(user) dispatch(fetchMyCounts()) }, [dispatch, user, gigs]);

  useEffect(()=>{
    // only redirect to login after auth check completes and there's no user
    if (authStatus === 'succeeded' && !user) navigate('/login');
  }, [authStatus, user, navigate]);
  const [hiredList, setHiredList] = React.useState([]);

  useEffect(()=>{
    let mounted = true;
    async function loadHired(){
      if(!user) return;
      try{
        const { data } = await api.get('/bids/me/hired');
        if(mounted) setHiredList(data.hired || []);
      }catch(e){ console.error('Failed to load hired list', e) }
    }
    loadHired();
    return ()=> mounted = false;
  }, [user, gigs]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome back{user?`, ${user.name}`:''}</h1>
        <p className="text-slate-400">Your project hub — manage gigs, bids and hires</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl shadow-soft card-3d">
          <div className="text-sm text-slate-300">Total Gigs Posted</div>
          <div className="text-2xl font-bold">{totalGigs}</div>
        </div>
        <div className="glass p-6 rounded-2xl shadow-soft card-3d">
          <div className="text-sm text-slate-300">Total Bids Made</div>
          <div className="text-2xl font-bold">{totalBids}</div>
        </div>
        <div className="glass p-6 rounded-2xl shadow-soft card-3d">
          <div className="text-sm text-slate-300">Hired Jobs</div>
          <div className="text-2xl font-bold">{hiredJobs}</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Gigs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gigs.slice(0,6).map(g => (
            <div key={g._id} className="glass p-4 rounded-2xl shadow-soft hover:shadow-lg transition card-3d">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{g.title}</h3>
                <div className="text-sm bg-white/5 px-2 py-1 rounded">${g.budget}</div>
              </div>
              <p className="text-slate-300 text-sm mt-2">{g.description.slice(0,100)}...</p>
              <div className="mt-3 text-xs text-slate-400">{g.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Hired Jobs</h2>
        {hiredList.length === 0 && <div className="text-slate-400">You have no hired jobs yet.</div>}
        <div className="space-y-3">
          {hiredList.map(h => (
            <div key={h._id} className="glass p-4 rounded-2xl shadow-soft flex justify-between items-center">
              <div>
                <div className="font-semibold">{h.gig?.title || 'Untitled'}</div>
                <div className="text-slate-300 text-sm">Owner: {h.gig?.owner?.name || 'Unknown'}</div>
                <div className="text-slate-300 text-sm">Price: ${h.price}</div>
              </div>
              <div>
                <a href={`/gigs/${h.gig?._id}`} className="px-3 py-2 rounded bg-indigo-600">View</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
