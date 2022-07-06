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
  const [clickedAdd, setClickedAdd] = useState("");

  useEffect(() => {
    // clear the form
    console.log("clear the form");
    setClickedAdd(false);
    setMealName("");
    setFormError("");
  }, [props.show, setMealName, setFormError]);

  useEffect(() => {
    // need to look for the creation of the meal we want
    if(props.addToSlot && clickedAdd) {
      const meal = selectedFam.meals.filter(m => m.meal_name === mealName);
      if(meal.length > 0) {
        console.log("new meal created...", meal[0]);
        props.addMealToSlotMethod(meal[0]);
        props.close("added");
      }
    }
  }, [selectedFam.meals, props.addToSlot, mealName, clickedAdd, props.addMealToSlotMethod])

  const Submit = () => {
    console.log("Add button clicked", mealName);
    if(mealName === "") {
      // need to throw an error
      //setFormError("Please specify a meal name");
      dispatch(addError("Please specify a meal name"));
    } else {
      // check if this is a case where we need to add the meal after creation
      if(props.addToSlot) {
        console.log("need to add the meal to a slot after creation");
        // check if the meal already exists
        if(selectedFam.meals.filter(m => m.meal_name === mealName).length > 0) {
          console.log("meal already exists, so just add it to the meal slot...");
          props.addMealToSlotMethod(selectedFam.meals.filter(m => m.meal_name === mealName)[0]);
          props.close("added");
        } else {
          console.log("need to add meal and then add to slot");
          setClickedAdd(true);
          dispatch(addMeal({
            meal_name: mealName,
            family_id: selectedFam.id,
          }));
        }
      } else {
        dispatch(addMeal({
          meal_name: mealName,
          family_id: selectedFam.id,
        }));
        props.close("added");
      }
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
            <input type="text" value={mealName} onChange={(e) => {setMealName(e.target.value)}} autoFocus/>
          </Block>
          {formError && <p ptype="error">{formError}</p>}
          <button type="button" onClick={Submit}>Add</button>
          <button type="button" onClick={Cancel}>Close</button>
        </Form>
      </ModalBox>
    </div>
  )
}