import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components";

import { 
  selectErrors,
  addError,
  clearOld
} from './errorSlice';

import { 
  selectFamilyError,
  clearError 
} from '../family/familySlice';

const ErrorTray = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 30;
`

const ErrorBox = styled.div`
  position: relative;
  padding: 10px;
  background-color: red;
  color: white;

  margin: 10px;

  p {
    padding: 0px;
    margin: 0px;
  }
`

export default function ErrorDisplay() {
  const dispatch = useDispatch();

  const errors = useSelector(selectErrors);
  const familyError = useSelector(selectFamilyError);

  const [loadWidget] = useState(0);

  // need to create clean up callback
  useEffect(() => {
    // clear the form
    console.log("creating error cleanup sub");
    setInterval(() => {
      dispatch(clearOld());
    }, 1000);
  }, [loadWidget]);

  // need to hook state to get the error messages as they come through
  useEffect(() => {
    // clear the form
    console.log("got a family error");
    if(familyError !== "") {
      dispatch(addError(familyError));
      dispatch(clearError());
    }
  }, [familyError, dispatch]);

  const ErrorBoxes = errors.map(error => <ErrorBox key={"error_" + error.id}>{error.error_text}</ErrorBox>)

  return(
    <div>
      <ErrorTray>
        {ErrorBoxes}
      </ErrorTray>
    </div>
  )
}