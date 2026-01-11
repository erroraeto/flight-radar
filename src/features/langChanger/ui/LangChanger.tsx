import React from 'react';
import { FormControl, InputLabel, MenuItem, Paper, Select } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { t } from 'i18next';
import { setLanguage } from '../model/langChangerSlice';

export const LangChanger = () => {
  const dispatch = useAppDispatch();
  const { lang } = useAppSelector((state) => state.language);
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Russian' },
    { code: 'kk', label: 'Kazakhstan' },
    { code: 'ja', label: 'Japan' },
  ];

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        backdropFilter: 'blur(3px)',
      }}
    >
      <FormControl sx={{ m: 1 }} size="small">
        <InputLabel id="language-label">{t('language')}</InputLabel>
        <Select
          labelId="language-label"
          label={t('language')}
          value={lang}
          onChange={(e) => {
            dispatch(setLanguage(e.target.value));
          }}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              {language.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
};
