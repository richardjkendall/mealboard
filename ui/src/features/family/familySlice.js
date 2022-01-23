import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from "axios";

import { API_BASE } from '../../utils/api';

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

export const addFamily = createAsyncThunk(
  'family/addFamily',
  async (item, thunkAPI) => {
    return axios.put(API_BASE() + 'family/', {
      family_name: item.family_name,
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const addOtherUser = createAsyncThunk(
  'family/addOtherUser',
  async (item, thunkAPI) => {
    return axios.put(API_BASE() + `family/${item.family_id}/other_users`, {
      role: "view",
      user_id: item.user_id
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const editOtherUser = createAsyncThunk(
  'family/editOtherUser',
  async (item, thunkAPI) => {
    return axios.patch(API_BASE() + `family/${item.family_id}/other_users/${item.other_user_id}`, {
      role: item.role,
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const deleteOtherUser = createAsyncThunk(
  'family/deleteOtherUser',
  async (item, thunkAPI) => {
    return axios.delete(API_BASE() + `family/${item.family_id}/other_users/${item.other_user_id}`)
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const addBoard = createAsyncThunk(
  'family/addBoard',
  async (item, thunkAPI) => {
    return axios.put(API_BASE() + `family/${item.family_id}/board`, {
      board_name: item.board_name,
      scope: item.private ? "private" : "family"
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const editBoard = createAsyncThunk(
  'family/editBoard',
  async (item, thunkAPI) => {
    return axios.patch(API_BASE() + `family/${item.family_id}/board/${item.board_id}`, {
      board_name: item.board_name,
      scope: item.private ? "private" : "family"
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const addMeal = createAsyncThunk(
  'family/addMeal',
  async (item, thunkAPI) => {
    return axios.put(API_BASE() + `family/${item.family_id}/meal`, {
      meal_name: item.meal_name,
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const deleteMeal = createAsyncThunk(
  'family/deleteMeal',
  async (item, thunkAPI) => {
    return axios.delete(API_BASE() + `family/${item.family_id}/meal/${item.meal_id}`)
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

const familySlice = createSlice({
  name: 'family',
  initialState: { 
    families: [], 
    gotFamilies: false,
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
    clearError: state => {
      state.error = "";
    }
  },
  extraReducers: {
    [addOtherUser.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      // need to update selectedFamily
      state.selectedFamily.other_users.push(action.payload);
      // and need to update the families list as well
      state.families = state.families.map(family => {
        if(family.id === action.payload.family_id) {
          family.other_users = state.selectedFamily.other_users;
          return family;
        } else {
          return family;
        }
      });
    },
    [addOtherUser.pending]: state => {
      state.loading = "yes";
    },
    [addOtherUser.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },
    [deleteOtherUser.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      // need to update selectedFamily to remove the 
      state.selectedFamily.other_users = state.selectedFamily.other_users.filter(other_user => other_user.id !== action.payload.other_user_id)
      // and need to update the families list as well
      state.families = state.families.map(family => {
        if(family.id === action.payload.family_id) {
          family.other_users = state.selectedFamily.other_users;
          return family;
        } else {
          return family;
        }
      });
    },
    [deleteOtherUser.pending]: state => {
      state.loading = "yes";
    },
    [deleteOtherUser.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },
    [editOtherUser.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      // need to update selectedFamily
      state.selectedFamily.other_users = state.selectedFamily.other_users.map(other_user => {
        if(other_user.id === action.payload.id) {
          return action.payload;
        } else {
          return other_user;
        }
      })
      // and need to update the families list as well
      state.families = state.families.map(family => {
        if(family.id === action.payload.family_id) {
          family.other_users = state.selectedFamily.other_users;
          return family;
        } else {
          return family;
        }
      });
    },
    [editOtherUser.pending]: state => {
      state.loading = "yes";
    },
    [editOtherUser.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },
    [editBoard.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      // need to save the edits
      state.selectedBoard = action.payload;
      // got through the families, find the board and then edit it
      state.selectedFamily.boards = state.selectedFamily.boards.map(board => {
        if(board.id === action.payload.id) {
          return action.payload;
        } else {
          return board;
        }
      });
      state.families = state.families.map(family => {
        if(family.id === action.payload.family_id) {
          family.boards = state.selectedFamily.boards;
          return family;
        } else {
          return family;
        }
      });
    },
    [editBoard.pending]: state => {
      state.loading = "yes";
    },
    [editBoard.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },
    [addFamily.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.families.push(action.payload);
      state.selectedFamily = action.payload;
      state.selectedBoard = {};
    },
    [addFamily.pending]: state => {
      state.loading = "yes";
    },
    [addFamily.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },
    [addBoard.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.selectedFamily.boards.push(action.payload);
      state.selectedBoard = action.payload;
      // need to add the board into the families 
      state.families = state.families.map(family => {
        if(family.id === action.payload.family_id) {
          family.boards.push(action.payload);
          return family;
        } else {
          return family;
        }
      });
    },
    [addBoard.pending]: state => {
      state.loading = "yes";
    },
    [addBoard.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },
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
      state.error = action.payload?.message || action.error.message;
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
      state.error = action.payload?.message || action.error.message;
    },
    [fetchAll.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.families = action.payload;
      state.gotFamilies = true;
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
      state.error = action.payload?.message || action.error.message;
    },
  }
})

export const { setFamily, setBoard, clearError } = familySlice.actions;

export const selectFamilies = state => state.family.families;
export const selectedFamily = state => state.family.selectedFamily;
export const selectedBoard = state => state.family.selectedBoard;
export const selectFamilyError = state => state.family.error;
export const selectGotFamilies = state => state.family.gotFamilies;


export default familySlice.reducer;