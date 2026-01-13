import { configureStore } from '@reduxjs/toolkit';
import { buttonLocateReducer } from '@features/buttonLocation';
import { langChangerReducer } from '@features/langChanger';
import { mapReducer } from '@features/mapView';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    location: buttonLocateReducer,
    language: langChangerReducer,
  },
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
