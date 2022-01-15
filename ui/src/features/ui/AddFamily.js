import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { 
  addFamily 
} from '../family/familySlice';

import ModalBox from './ModalBox';
import { Form, Block } from './FormWidgets';

export default function AddBoard(props) {
  const dispatch = useDispatch();

  const [familyName, setFamilyName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // clear the form
    console.log("clear the form");
    setFamilyName("");
    setFormError("");
  }, [props.show, setFamilyName, setFormError]);

  const Submit = () => {
    console.log("Add button clicked", familyName);
    if(familyName === "") {
      // need to throw an error
      setFormError("Please specify a family group name");
    } else {
      dispatch(addFamily({
        family_name: familyName
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
          <p>Add a Family Group</p>
          <Block>
            <label>Family Name:</label>
            <input type="text" value={familyName} onChange={(e) => {setFamilyName(e.target.value)}} />
          </Block>
          {formError && <p ptype="error">{formError}</p>}
          <button type="button" onClick={Submit}>Add</button>
          <button type="button" onClick={Cancel}>Cancel</button>
        </Form>
      </ModalBox>
    </div>
  )
}