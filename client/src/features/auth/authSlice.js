import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchMe = createAsyncThunk('auth/fetchMe', async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
});

export const login = createAsyncThunk('auth/login', async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.user;
});

export const register = createAsyncThunk('auth/register', async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {
    logoutLocal(state){ state.user = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => { state.status = 'loading' })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; state.status = 'succeeded' })
      .addCase(fetchMe.rejected, (state) => { state.user = null; state.status = 'failed' })
      .addCase(login.fulfilled, (state, action) => { state.user = action.payload })
      .addCase(register.fulfilled, (state, action) => { state.user = action.payload })
  }
});

export const { logoutLocal } = authSlice.actions;
export default authSlice.reducer;
