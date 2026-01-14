// import axios from 'axios';

// const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:4000';

// const api = axios.create({
//   baseURL: `${base}/api`,
//   withCredentials: true
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true, // 🔥 MOST IMPORTANT
});

export default api;
