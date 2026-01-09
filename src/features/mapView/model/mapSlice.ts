import { createSlice } from '@reduxjs/toolkit';
import { MapState } from './types';

const initialState: MapState = {
  view: {
    longitude: 37.6176,
    latitude: 55.7558,
    zoom: 5,
  },
  theme: 'light',
  mapMode: 'globe',
  planes: [],
  targetPlane: null,
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    zoomIn(state) {
      state.view.zoom = state.view.zoom + 1;
    },
    zoomOut(state) {
      state.view.zoom = state.view.zoom - 1;
    },
    changeTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    changeProjection(state) {
      state.mapMode = state.mapMode === 'globe' ? 'mercator' : 'globe';
    },
    setViewState(state, action) {
      state.view = action.payload;
    },
    setPlanes(state, action) {
      state.planes = action.payload;
    },
    setTargetPlane(state, action) {
      state.targetPlane = action.payload;
    },
  },
});

export const mapReducer = mapSlice.reducer;
export const { zoomIn, zoomOut, changeTheme, changeProjection, setViewState, setPlanes, setTargetPlane } =
  mapSlice.actions;
