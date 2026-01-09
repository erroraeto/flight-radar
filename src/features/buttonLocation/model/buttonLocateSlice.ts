import { createSlice } from '@reduxjs/toolkit';
import { LocationProps } from './types';
import { getLocation } from '../lib/thunks';

const initialState: LocationProps = {
  geoLocate: null,
  geoStatus: 'off',
};

export const buttonLocateSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setGeoStatus(state, action) {
      state.geoStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLocation.pending, (state) => {
        state.geoStatus = 'searching';
      })
      .addCase(getLocation.fulfilled, (state, action) => {
        if (action.payload) {
          state.geoLocate = action.payload;
          state.geoStatus = 'fixed';
        }
      })
      .addCase(getLocation.rejected, (state) => {
        state.geoStatus = 'off';
      });
  },
});

export const { setGeoStatus } = buttonLocateSlice.actions;
export const buttonLocateReducer = buttonLocateSlice.reducer;
