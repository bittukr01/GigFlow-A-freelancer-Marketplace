import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGigById, fetchGigs } from '../features/gig/gigSlice'
import { createBid, hire } from '../features/bid/bidSlice'
import Modal from '../components/Modal'

export default function GigDetails(){
  const { id } = useParams();
  const dispatch = useDispatch();
  const { gig, bids } = useSelector(s => s.gigs.current || {});
  const user = useSelector(s => s.auth.user);
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(()=>{ if(id) dispatch(fetchGigById(id)) }, [dispatch, id]);

  const submitBid = async (e) => {
    e.preventDefault();
    try{
      await dispatch(createBid({ gigId: id, message, price })).unwrap();
      setMessage(''); setPrice('');
      // refresh gig details so owner will see the new bid and UI updates
      dispatch(fetchGigById(id));
    }catch(e){}
  }

  const doHire = async (bidId) => {
    setConfirm(bidId);
    setModalOpen(true);
  }

  const confirmHire = async () => {
    if(!confirm) return setModalOpen(false);
    setActionMsg(null);
    try{
      const res = await dispatch(hire({ gigId: id, bidId: confirm })).unwrap();
      // show success briefly
      setActionMsg({ type: 'success', text: 'Freelancer hired successfully' });
      await dispatch(fetchGigById(id)).unwrap();
      await dispatch(fetchGigs()).unwrap();
      // also refresh counts for owner and bidder
      dispatch(fetchMyCounts()).catch(()=>{});
    }catch(err){
      console.error('Hire failed', err);
      const text = err?.message || (err?.response && err.response.data && err.response.data.message) || JSON.stringify(err) || 'Hire failed';
      setActionMsg({ type: 'error', text });
    }finally{
      setModalOpen(false);
      setConfirm(null);
      // clear message after a short delay
      setTimeout(()=>setActionMsg(null), 4000);
    }
  }

  if(!gig) return <div className="text-center text-slate-300">Loading...</div>

  const isOwner = user && gig.owner && user.id === gig.owner._id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass p-6 rounded-2xl shadow-soft">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{gig.title}</h1>
            <p className="text-slate-300 mt-2">{gig.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-300">Budget</div>
            <div className="text-2xl font-bold">${gig.budget}</div>
            <div className="mt-2 text-xs">Status: <span className="font-semibold">{gig.status}</span></div>
          </div>
        </div>
      </div>

      {!isOwner && (
        <div className="glass p-4 rounded-2xl shadow-soft">
          <h3 className="font-semibold mb-3">Place a Bid</h3>
          <form onSubmit={submitBid} className="space-y-3">
            <textarea value={message} onChange={e=>setMessage(e.target.value)} className="w-full p-3 rounded bg-transparent border border-white/10" placeholder="Message"></textarea>
            <input value={price} onChange={e=>setPrice(e.target.value)} className="w-1/3 p-3 rounded bg-transparent border border-white/10" placeholder="Price" />
            <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-500">Send Bid</button>
          </form>
        </div>
      )}

      {isOwner && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Bids</h3>
          <div className="space-y-3">
            {bids && bids.map(b=> (
              <div key={b._id} className="glass p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="font-semibold">{b.bidder?.name || b.bidder}</div>
                  <div className="text-slate-300 text-sm">${b.price} — {b.message}</div>
                </div>
                <div className="flex items-center gap-3">
                  {/* show per-bid status */}
                  <div className="text-sm text-slate-300 mr-2">
                    {b.status ? (
                      <span className={b.status==='Hired'? 'text-green-400 font-semibold' : b.status==='Rejected'? 'text-red-400 font-semibold' : 'text-yellow-300'}>{b.status}</span>
                    ) : null}
                  </div>
                  <div className="flex gap-3">
                    <button
                      disabled={b.status && b.status !== 'Pending'}
                      onClick={()=>doHire(b._id)}
                      className={`px-3 py-2 rounded ${b.status==='Hired' ? 'bg-gray-600' : 'bg-green-600'}`}
                    >{b.status==='Hired' ? 'Hired' : (b.status==='Rejected' ? 'Rejected' : 'Hire')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={modalOpen} title="Confirm hire" onClose={()=>setModalOpen(false)}>
        <p className="text-slate-300 mb-4">Are you sure you want to hire this bidder? This will assign the gig and notify the freelancer.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded bg-white/5">Cancel</button>
          <button onClick={confirmHire} className="px-4 py-2 rounded bg-green-600">Confirm Hire</button>
        </div>
      </Modal>
    </div>
  )
}
