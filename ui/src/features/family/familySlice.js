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
    },
    setBoard: (state, action) => {
      state.selectedBoard = action.payload;
    },
  },
  extraReducers: {
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