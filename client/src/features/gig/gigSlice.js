import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchGigs = createAsyncThunk('gigs/fetchGigs', async (search='') => {
  const { data } = await api.get('/gigs', { params: { search } });
  return data.gigs;
});

export const fetchGigById = createAsyncThunk('gigs/fetchGigById', async (id) => {
  const { data } = await api.get(`/gigs/${id}`);
  return data;
});

export const createGig = createAsyncThunk('gigs/createGig', async (payload) => {
  const { data } = await api.post('/gigs', payload);
  return data.gig;
});

const gigSlice = createSlice({
  name: 'gigs',
  initialState: { list: [], current: null, status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGigs.fulfilled, (state, action) => { state.list = action.payload })
      .addCase(fetchGigById.fulfilled, (state, action) => { state.current = action.payload })
      .addCase(createGig.fulfilled, (state, action) => { state.list.unshift(action.payload) })
  }
});

export default gigSlice.reducer;
