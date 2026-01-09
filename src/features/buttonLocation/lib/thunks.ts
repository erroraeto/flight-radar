import { createAsyncThunk } from '@reduxjs/toolkit';

export const getLocation = createAsyncThunk('location/getLocation', async (_, { rejectWithValue }) => {
  if (!navigator.geolocation) {
    return rejectWithValue('Geolocation is not supported');
  }

  return new Promise<[number, number]>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        resolve([longitude, latitude]);
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true },
    );
  });
});
