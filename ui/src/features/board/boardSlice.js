import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from "axios";

var API_BASE = function() {
  if(window.location.hostname === "localhost") {
    return "http://localhost:5000/";
  } else {
    return "/"
  }
}

export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (item, thunkAPI) => {
    const response = await axios.get(API_BASE() + `family/${item.family_id}/board/${item.board_id}`);
    console.log("got following response", response.data);
    return response.data;
  }
)

export const boardSlice = createSlice({
  name: 'board',
  initialState: {
    loading: 'idle', 
    error: '',
    board: {},
    week: {},
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
  extraReducers: {
    [fetchBoard.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.board = action.payload;
      
    },
    [fetchBoard.pending]: state => {
      state.loading = "yes";
    },
    [fetchBoard.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.error.message;
    },
  }
});

export const { switchToAll, switchToRunning, switchToFailed } = boardSlice.actions;

export const selectDays = state => state.board.days;
export const selectMeals = state => state.board.meals;

export default boardSlice.reducer;