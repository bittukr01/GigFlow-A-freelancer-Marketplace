import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const createBid = createAsyncThunk('bids/createBid', async (payload) => {
  const { data } = await api.post('/bids', payload);
  return data.bid;
});

export const hire = createAsyncThunk('bids/hire', async (payload) => {
  try{
    console.log('Hiring request payload:', payload);
    const { data } = await api.post('/bids/hire', payload);
    console.log('Hiring response:', data);
    return data;
  }catch(err){
    console.error('Hiring request failed', err?.response || err);
    const msg = err?.response?.data?.message || err?.message || 'Hire request failed';
    // throw a normalized Error so callers can read err.message
    throw new Error(msg);
  }
});

export const fetchMyCounts = createAsyncThunk('bids/fetchMyCounts', async () => {
  const { data } = await api.get('/bids/me/counts');
  return data;
});

const bidSlice = createSlice({
  name: 'bids',
  initialState: { status: 'idle', lastAction: null, counts: { totalBids: 0, hiredJobs: 0 } },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBid.fulfilled, (state, action) => { state.lastAction = { type: 'created', bid: action.payload } })
      .addCase(hire.fulfilled, (state, action) => { state.lastAction = { type: 'hired', payload: action.payload } })
      .addCase(fetchMyCounts.fulfilled, (state, action) => { state.counts = action.payload })
  }
});

export default bidSlice.reducer;
