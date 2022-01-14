import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from "axios";

var API_BASE = function() {
  if(window.location.hostname === "localhost") {
    return "http://localhost:5000/";
  } else {
    return "/"
  }
}

export const fetchAll = createAsyncThunk(
  'family/fetchAll',
  async (thunkAPI) => {
    const response = await axios.get(API_BASE() + "family");
    console.log("got following response", response.data);
    var families = [];
    response.data.forEach(element => {
      var family = element;
      families.push(family);
    });
    return families;
  }
)

export const addMeal = createAsyncThunk(
  'family/addMeal',
  async (item, thunkAPI) => {
    const response = await axios.put(API_BASE() + `family/${item.family_id}/meal`, {
      meal_name: item.meal_name,
    });
    console.log("got following response", response.data);
    return response.data;
  }
)

export const deleteMeal = createAsyncThunk(
  'family/deleteMeal',
  async (item, thunkAPI) => {
    const response = await axios.delete(API_BASE() + `family/${item.family_id}/meal/${item.meal_id}`);
    console.log("got following response", response.data);
    return response.data;
  }
)

const familySlice = createSlice({
  name: 'family',
  initialState: { 
    families: [], 
    selectedFamily: {},
    selectedBoard: {},
    loading: 'idle', 
    error: '',
  },
  reducers: {
    setFamily: (state, action) => {
      state.selectedFamily = action.payload;
      if(action.payload.boards.length > 0) {
        state.selectedBoard = action.payload.boards[0];
      } else {
        console.log("this family has no boards");
        state.selectedBoard = {};
      }
    },
    setBoard: (state, action) => {
      state.selectedBoard = action.payload;
    },
  },
  extraReducers: {
    [deleteMeal.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.selectedFamily.meals = state.selectedFamily.meals.filter(meal => meal.id !== action.payload.id);
    },
    [deleteMeal.pending]: state => {
      state.loading = "yes";
    },
    [deleteMeal.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.error.message;
    },
    [addMeal.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.selectedFamily.meals.push(action.payload);
    },
    [addMeal.pending]: state => {
      state.loading = "yes";
    },
    [addMeal.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.error.message;
    },
    [fetchAll.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.families = action.payload;
      if(action.payload.length > 0) {
        state.selectedFamily = action.payload[0];
        if(action.payload[0].boards.length > 0) {
          state.selectedBoard = action.payload[0].boards[0];
        }
      }
    },
    [fetchAll.pending]: state => {
      state.loading = "yes";
    },
    [fetchAll.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.error.message;
    },
  }
})

export const { setFamily, setBoard } = familySlice.actions;

export const selectFamilies = state => state.family.families;
export const selectedFamily = state => state.family.selectedFamily;
export const selectedBoard = state => state.family.selectedBoard;

export default familySlice.reducer;