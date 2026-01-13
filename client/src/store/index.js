import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import gigReducer from '../features/gig/gigSlice'
import bidReducer from '../features/bid/bidSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigReducer,
    bids: bidReducer
  }
});
