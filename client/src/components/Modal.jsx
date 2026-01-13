import React from 'react'

export default function Modal({ open, title, children, onClose }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative max-w-lg w-full bg-slate-900/90 glass p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
