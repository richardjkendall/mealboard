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

export const { switchToAll, switchToRunning, switchToFailed } = boardSlice.actions;

export const selectDays = state => state.board.days;
export const selectMeals = state => state.board.meals;
export const selectBoard = state => state.board.board;
export const selectWeek = state => state.board.week;
export const selectSelectedWeek = state => state.board.selectedWeek;

export default boardSlice.reducer;