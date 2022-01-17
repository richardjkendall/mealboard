import { createSlice } from '@reduxjs/toolkit';
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';

export const errorSlice = createSlice({
  name: 'error',
  initialState: {
    errors: []
  },
  reducers: {
    addError: (state, action) => {
      state.errors.push({
        created: moment().toISOString(),
        id: uuidv4(),
        error_text: action.payload
      });
    },
    clearOld: state => {
      var dn = moment();
      state.errors = state.errors.filter(error => {
        var diff = dn.diff(moment(error.created), 'seconds');
        console.log(error.id, error.created, diff);
        return diff < 5;
      });
    }
  },
  extraReducers: {}
});

export const { addError, clearOld } = errorSlice.actions;

export const selectErrors = state => state.error.errors;

export default errorSlice.reducer;