import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import { 
  selectedFamily,
  addMeal 
} from '../family/familySlice';

import ModalBox from './ModalBox';

const MealForm = styled.form`

  p:first-child {
    margin-top: 0px;
    font-weight: bold;
  }

  p[ptype="error"] {
    color: red;
  }

  button:last-child {
    margin-top: 10px;
  }
`

const Block = styled.div`
  label {
    display: inline-block;
    width: 200px;
  }

  input[type="text"] {
    width: 250px;
  }
`

export default function AddEditMeal(props) {
  const dispatch = useDispatch();
  const selectedFam = useSelector(selectedFamily);

  const [mealName, setMealName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // clear the form
    console.log("clear the form");
    setMealName("");
    setFormError("");
  }, [props.show, setMealName, setFormError]);

  const Submit = () => {
    console.log("Add button clicked", mealName);
    if(mealName === "") {
      // need to throw an error
      setFormError("Please specify a meal name");
    } else {
      dispatch(addMeal({
        meal_name: mealName,
        family_id: selectedFam.id,
      }));
      props.close("added");
    }
  }

  const Cancel = () => {
    props.close("cancel");
  }

  return (
    <div>
      <ModalBox show={props.show} close={props.close}>
        <MealForm>
          <p>Add a Meal</p>
          <Block>
            <label>Meal Name:</label>
            <input type="text" value={mealName} onChange={(e) => {setMealName(e.target.value)}} />
          </Block>
          {formError && <p ptype="error">{formError}</p>}
          <button type="button" onClick={Submit}>Add</button>
          <button type="button" onClick={Cancel}>Cancel</button>
        </MealForm>
      </ModalBox>
    </div>
  )
}