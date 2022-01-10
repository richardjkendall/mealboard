import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from "axios";
import moment from "moment";

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

export const fetchWeek = createAsyncThunk(
  'board/fetchWeek',
  async (item, thunkAPI) => {
    const response = await axios.get(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week/${item.week_id}`);
    console.log("got following response", response.data);
    return response.data;
  }
)

export const addMealToWeek = createAsyncThunk(
  'board/addMealToWeek',
  async (item, thunkAPI) => {
    const response = await axios.put(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week/${item.week_id}/meal`, {
      meal_id: item.meal_id,
      meal_slot: item.meal_slot,
      day: item.day
    });
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
    selectedWeek: {},
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
    clearBoard: state => {
      state.board = {};
      state.week = {};
      state.selectedWeek = {};
    },
  },
  extraReducers: {
    [addMealToWeek.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.week.meals.push(action.payload);
    },
    [addMealToWeek.pending]: state => {
      state.loading = "yes";
    },
    [addMealToWeek.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.error.message;
    },
    [fetchWeek.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.week = action.payload;
    },
    [fetchWeek.pending]: state => {
      state.loading = "yes";
    },
    [fetchWeek.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.error.message;
    },
    [fetchBoard.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.board = action.payload;
      // get the closest week
      state.board.weeks.sort((a, b) => {
        var da = moment(a.week_start_date);
        var db = moment(b.week_start_date);
        var dn = moment();
        var diffa = Math.abs(da.diff(dn, 'days'));
        var diffb = Math.abs(db.diff(dn, 'days'));
        console.log("diffa", diffa, "diffb", diffb);
        if(diffa === diffb) {
          return 0;
        } else {
          if(diffa < diffb) {
            return -1;
          } else {
            return 1;
          }
        }
      });
      console.log("weeks sorted", state.board.weeks);
      if(state.board.weeks.length > 0) {
        state.selectedWeek = state.board.weeks[0];
      } else {
        state.selectedWeek = {};
      }
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

export const { clearBoard } = boardSlice.actions;

export const selectDays = state => state.board.days;
export const selectMeals = state => state.board.meals;
export const selectBoard = state => state.board.board;
export const selectWeek = state => state.board.week;
export const selectSelectedWeek = state => state.board.selectedWeek;

export default boardSlice.reducer;