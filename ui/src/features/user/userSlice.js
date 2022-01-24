import axios from "axios";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { API_BASE } from "../../utils/api";

export const checkUserExists = async (user) => {
  var res = await axios.get(API_BASE() + "user/", {params: {username: user}})
    .then(resp => {
      // user was found
      return {
        status: "okay",
        username: resp.data.username,
        id: resp.data.id
      }
    }).catch(err => {
      if(err.response.status === 404) {
        console.log("error, user not found");
        // user was not found
        return {
          status: "error",
          reason: "User could not be found"
        }
      }
    });
  console.log(res);
  return res;
}

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (item, thunkAPI) => {
    return axios.get(API_BASE() + `user/`)
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const editUser = createAsyncThunk(
  'user/editUser',
  async (item, thunkAPI) => {
    return axios.patch(API_BASE() + `user/`, {
      first_name: item.first_name,
      last_name: item.last_name,
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const createUser = createAsyncThunk(
  'user/createUser',
  async (item, thunkAPI) => {
    return axios.put(API_BASE() + `user/`, {
      first_name: item.first_name,
      last_name: item.last_name,
    })
    .then(response => response.data)
    .catch(error => thunkAPI.rejectWithValue(error?.response?.data || error))
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    loading: 'idle', 
    error: '',
    user: {},
    gotUser: false,
    newUser: false,
  },
  reducers: {
    
    clearError: state => {
      state.error = "";
    }
  },
  extraReducers: {
    [createUser.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.user = action.payload;
      state.gotUser = true;
      state.newUser = false;
    },
    [createUser.pending]: state => {
      state.loading = "yes";
    },
    [createUser.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },

    [editUser.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.user.first_name = action.payload.first_name;
      state.user.last_name = action.payload.last_name;
    },
    [editUser.pending]: state => {
      state.loading = "yes";
    },
    [editUser.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.payload?.message || action.error.message;
    },
    [fetchUser.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.user = action.payload;
      state.gotUser = true;
    },
    [fetchUser.pending]: state => {
      state.loading = "yes";
    },
    [fetchUser.rejected]: (state, action) => {
      state.loading = "idle";
      if(action.payload?.message || action.error.message === "User not found") {
        // need to trigger the create user box
        state.gotUser = false;
        state.newUser = true;
      }
      state.error = action.payload?.message || action.error.message;
    },
  }
});

export const { clearError } = userSlice.actions;

export const selectUser = state => state.user.user;
export const selectGotUser = state => state.user.gotUser;
export const selectNewUser = state => state.user.newUser;


export default userSlice.reducer;