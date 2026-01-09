import { createSlice } from '@reduxjs/toolkit';
import { LanguageProps } from './types';
import i18n from '../../../i18n';

const initialState: LanguageProps = {
  lang: 'en',
};

export const langChangerSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage(state, action) {
      state.lang = action.payload;
      i18n.changeLanguage(action.payload);
    },
  },
});

export const { setLanguage } = langChangerSlice.actions;
export const langChangerReducer = langChangerSlice.reducer;
