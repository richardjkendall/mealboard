import { configureStore } from '@reduxjs/toolkit';

import boardReducer from '../features/board/boardSlice';
import familyReducer from '../features/family/familySlice';
import errorReducer from '../features/ui/errorSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    family: familyReducer,
    error: errorReducer,
    user: userReducer,
  },
});
