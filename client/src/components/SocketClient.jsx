import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useSelector, useDispatch } from 'react-redux'
import { fetchGigs, fetchGigById } from '../features/gig/gigSlice'
import { fetchMyCounts } from '../features/bid/bidSlice'

export default function SocketClient(){
  const user = useSelector(s=>s.auth.user);
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);

  useEffect(()=>{
    if(!user) return;
    const s = io('http://localhost:4000', { query: { userId: user.id }, transports: ['websocket'] });
    setSocket(s);
    s.on('hired', (payload)=>{
      setNotifications(n=>[{id:Date.now(), text:`You have been hired for ${payload.project}`, payload}, ...n]);
      // refresh gigs and current gig if open
      dispatch(fetchGigs());
      if (payload.gigId) dispatch(fetchGigById(payload.gigId));
      // refresh my bid/hired counts so Dashboard updates for bidder
      dispatch(fetchMyCounts());
    });

    s.on('new_bid', (payload)=>{
      // notify owner and refresh gigs
      setNotifications(n=>[{id:Date.now(), text:`New bid on ${payload.gigId}`, payload}, ...n]);
      dispatch(fetchGigs());
      if (payload.gigId) dispatch(fetchGigById(payload.gigId));
    });
    return ()=> s.disconnect();
  }, [user]);

  return (
    <div className="fixed bottom-6 right-6 w-80 space-y-2 z-50">
      {notifications.map(n=> (
        <div key={n.id} className="glass p-3 rounded shadow-lg animate-fade">
          <div className="font-semibold">{n.text}</div>
        </div>
      ))}
    </div>
  )
}
