import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from "axios";
import moment from "moment";

import { API_BASE } from '../../utils/api';

export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (item, thunkAPI) => {
    return axios.get(API_BASE() + `family/${item.family_id}/board/${item.board_id}`)
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const fetchWeek = createAsyncThunk(
  'board/fetchWeek',
  async (item, thunkAPI) => {
    return axios.get(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week/${item.week_id}`)
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const addWeek = createAsyncThunk(
  'board/addWeek',
  async (item, thunkAPI) => {
    return axios.put(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week`, {
      week_start_date: item.week_start_date,
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const addMealToWeek = createAsyncThunk(
  'board/addMealToWeek',
  async (item, thunkAPI) => {
    return axios.put(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week/${item.week_id}/meal`, {
      meal_id: item.meal_id,
      meal_slot: item.meal_slot,
      day: item.day
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const removeMealFromWeek = createAsyncThunk(
  'board/removeMealFromWeek',
  async (item, thunkAPI) => {
    return axios.delete(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week/${item.week_id}/meal/${item.week_to_meal_id}`)
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const copyFromWeek = createAsyncThunk(
  'board/copyFromWeek',
  async (item, thunkAPI) => {
    return axios.post(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week/${item.week_id}`, {
      from_week: item.from_week_id,
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const addWeekAndCopy = createAsyncThunk(
  'board/addWeekAndCopy',
  async (item, thunkAPI) => {
    return axios.put(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week`, {
      week_start_date: item.week_start_date,
    })
    .then(response => {
      console.log(`week created with id ${response.data.id}`);
      return axios.post(API_BASE() + `family/${item.family_id}/board/${item.board_id}/week/${response.data.id}`, {
        from_week: item.from_week_id,
      })
      .then(response => response.data)
      .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
    })
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
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
    deleteMealFromWeek: (state, action) => {
      if(state.week.meals.length > 0) {
        state.week.meals = state.week.meals.filter(meal => meal.meal.id !== action.payload);
      }
    },
    switchWeek: (state, action) => {
      state.selectedWeek = action.payload;
    },
    clearError: state => {
      state.error = "";
    }
  },
  extraReducers: {
    [addWeekAndCopy.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      // need to add the week to the board weeks and select the week
      state.board.weeks.push(action.payload);
      state.selectedWeek = action.payload;
    },
    [addWeekAndCopy.pending]: state => {
      state.loading = "yes";
    },
    [addWeekAndCopy.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },

    [copyFromWeek.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.week.meals = action.payload.meals;
      state.selectedWeek = action.payload;
    },
    [copyFromWeek.pending]: state => {
      state.loading = "yes";
    },
    [copyFromWeek.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },

    [removeMealFromWeek.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.week.meals = state.week.meals.filter(a => a.id !== action.payload.week_to_meal_id);
    },
    [removeMealFromWeek.pending]: state => {
      state.loading = "yes";
    },
    [removeMealFromWeek.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },

    [addWeek.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      // need to add the week to the board weeks and select the week
      state.board.weeks.push(action.payload);
      state.selectedWeek = action.payload;
    },
    [addWeek.pending]: state => {
      state.loading = "yes";
    },
    [addWeek.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },

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
      state.error = action.payload?.message || action.error.message;
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
      state.error = action.payload?.message || action.error.message;
    },
    [fetchBoard.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.board = action.payload;
      // get the closest week
      state.board.weeks.sort((a, b) => {
        var da = moment(a.week_start_date);
        var db = moment(b.week_start_date);
        // need to make dn the Monday date  // done
        var now = new Date();
        var currentDay = now.getDay() === 0 ? 6 : now.getDay() -1;
        var dn = moment().subtract(currentDay, 'days');
        var diffa = Math.abs(da.diff(dn, 'days'));
        var diffb = Math.abs(db.diff(dn, 'days'));
        //console.log("diffa", diffa, "diffb", diffb);
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
      state.error = action.payload?.message || action.error.message;
    },
  }
});

export const { clearBoard, deleteMealFromWeek, switchWeek, clearError } = boardSlice.actions;

export const selectDays = state => state.board.days;
export const selectMeals = state => state.board.meals;
export const selectBoard = state => state.board.board;
export const selectWeek = state => state.board.week;
export const selectSelectedWeek = state => state.board.selectedWeek;
export const selectBoardError = state => state.board.error;


export default boardSlice.reducer;