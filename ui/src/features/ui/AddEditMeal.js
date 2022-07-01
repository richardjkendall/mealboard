import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { 
  selectedFamily,
  addMeal 
} from '../family/familySlice';

import ModalBox from './ModalBox';
import { Form, Block } from './FormWidgets';
import { addError } from './errorSlice';

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
      //setFormError("Please specify a meal name");
      dispatch(addError("Please specify a meal name"));
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
        <Form>
          <p>Add a Meal</p>
          <Block>
            <label>Meal Name:</label>
            <input type="text" value={mealName} onChange={(e) => {setMealName(e.target.value)}} />
          </Block>
          {formError && <p ptype="error">{formError}</p>}
          <button type="button" onClick={Submit}>Add</button>
          <button type="button" onClick={Cancel}>Close</button>
        </Form>
      </ModalBox>
    </div>
  )
}