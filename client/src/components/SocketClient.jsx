import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGigs, fetchGigById } from '../features/gig/gigSlice';
import { fetchMyCounts } from '../features/bid/bidSlice';

export default function SocketClient() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // ✅ IMPORTANT FIX: localhost hata diya, env based URL
    const SOCKET_URL =
      import.meta.env.VITE_API_URL || 'http://localhost:4000';

    const s = io(SOCKET_URL, {
      query: { userId: user.id },
      withCredentials: true,        // ✅ cookie support
      transports: ['websocket'],
    });

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
    });

    s.on('hired', (payload) => {
      setNotifications((n) => [
        {
          id: Date.now(),
          text: `You have been hired for ${payload.project}`,
          payload,
        },
        ...n,
      ]);

      dispatch(fetchGigs());
      if (payload.gigId) dispatch(fetchGigById(payload.gigId));
      dispatch(fetchMyCounts());
    });

    s.on('new_bid', (payload) => {
      setNotifications((n) => [
        {
          id: Date.now(),
          text: `New bid received`,
          payload,
        },
        ...n,
      ]);

      dispatch(fetchGigs());
      if (payload.gigId) dispatch(fetchGigById(payload.gigId));
    });

    s.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      s.disconnect();
    };
  }, [user, dispatch]);

  return (
    <div className="fixed bottom-6 right-6 w-80 space-y-2 z-50">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="glass p-3 rounded shadow-lg animate-fade"
        >
          <div className="font-semibold">{n.text}</div>
        </div>
      ))}
    </div>
  );
}
