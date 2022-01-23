import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { 
  selectUser,
  editUser,
  createUser
} from '../user/userSlice';

import ModalBox from './ModalBox';
import { Form, Block } from './FormWidgets';

export default function AddUser(props) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // clear the form
    console.log("clear the form");
    setFirstName(props.mode === "edit" ? user.first_name : "");
    setLastName(props.mode === "edit" ? user.last_name : "");
    setFormError("");
  }, [props.show, setFirstName, setLastName, setFormError, props.mode, user.first_name, user.last_name]);

  const Submit = () => {
    if(firstName === "") {
      // need to throw an error
      setFormError("Please enter your first name");
    } else {
      if(lastName === "") {
        setFormError("Please enter your last name")
      } else {
        if(props.mode === "add") {
          dispatch(createUser({
            first_name: firstName,
            last_name: lastName,
          }))
          props.close("added");
        } else {
          dispatch(editUser({
            first_name: firstName,
            last_name: lastName,
          }))
          props.close("edited");
        }
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
          <p>{props.mode === "add" ? "Welcome!  Please enter your details" : "Edit User Details"} </p>
          <Block>
            <label>First Name:</label>
            <input type="text" value={firstName} onChange={(e) => {setFirstName(e.target.value)}} />
          </Block>
          <Block>
            <label>Last Name:</label>
            <input type="text" value={lastName} onChange={(e) => {setLastName(e.target.value)}} />
          </Block>
          {formError && <p ptype="error">{formError}</p>}
          <button type="button" onClick={Submit}>{props.mode === "add" ? "Create" : "Edit"}</button>
          {props.mode !== "add" && <button type="button" onClick={Cancel}>Cancel</button>}
        </Form>
      </ModalBox>
    </div>
  )
}