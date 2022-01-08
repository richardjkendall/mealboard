import { configureStore } from '@reduxjs/toolkit';
import boardReducer from '../features/board/boardSlice';
import familyReducer from '../features/family/familySlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    family: familyReducer,
  },
});
