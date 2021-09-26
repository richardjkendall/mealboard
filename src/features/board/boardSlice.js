import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const boardSlice = createSlice({
  name: 'board',
  initialState: {
    meals: [
      "Breakfast",
      "Lunch",
      "Dinner"
    ],
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    dishes: [
      {
        id: "1",
        name: "Pea & Pie"
      },
      {
        id: "2",
        name: "Burgers"
      },
      {
        id: "3",
        name: "Salmon & potatoes"
      },
      {
        id: "4",
        name: "Fried Rice"
      },
      {
        id: "1",
        name: "Pea & Pie"
      },
    ]
  },
  reducers: {
    switchToAll: state => {
      state.value = "all";
    },
    switchToRunning: state => {
      state.value = "running";
    },
    switchToFailed: state => {
      state.value = "failed";
    },
  },
});

export const { switchToAll, switchToRunning, switchToFailed } = boardSlice.actions;

export const selectDays = state => state.board.days;
export const selectMeals = state => state.board.meals;


export default boardSlice.reducer;