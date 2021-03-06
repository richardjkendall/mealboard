import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { 
  addFamily,
  editFamily,
  selectedFamily,
  editOtherUser,
  deleteOtherUser,
  addOtherUser
} from '../family/familySlice';

import {
  clearBoard,
} from '../board/boardSlice';

import { 
  checkUserExists, 
  inviteNewUser
} from '../user/userSlice';

import { addError } from './errorSlice';

import ModalBox from './ModalBox';
import { Form, Block } from './FormWidgets';

import plusimg from './plus.png';
import crossimg from './cross.png';

const UserTable = styled.div`
  display: flex;
  flex-direction: column;
`

const UserRow = styled.div`
  display: flex;
  flex-direction: row;

  &:not(:last-of-type) {
    border-bottom: 0.5px solid #cccccc;
  }
`

const UserNameCell = styled.div`
  flex: 2 1 auto;
  padding: 2px;
`

const UserRoleCell = styled.div`
  flex: 0 1 auto;
  padding: 2px;
  

  select {
    border: solid 1px #cccccc;
    margin-right: 8px;
  }

  input[type="text"] {
    border: solid 1px #cccccc;
    margin: 0px;
    margin-right: 8px;

    padding: 2px;
    padding-left: 4px;
  }
`

const UserDeleteCell = styled.div`
  flex: 0 1 auto;
  padding: 2px;
`

const Plus = styled.img`
  width: 20px;
  height: 20px;
  opacity: 0.5;
  cursor: pointer;
  vertical-align: middle;

  &:hover {
    opacity: 1;
  }
`

const Cross = styled.img`
  width: 20px;
  height: 20px;
  opacity: 0.5;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

const UserWidget = (props) => {

  const [userName, setUserName] = useState("");

  const AddOtherUser = () => {
    if(userName === "") {
      props.error("Please populate the username.");
    } else {
      props.add(userName);
      setUserName("");
    }
  }

  const Users = props.users.map(user => <UserRow key={"usermap_" + user.id}>
    <UserNameCell>{user.user.username} ({user.user.first_name === null && user.user.last_name === null ? <i>New User</i> : user.user.first_name + " " + user.user.last_name})</UserNameCell>
    <UserRoleCell>
      <select value={user.role} onChange={e => props.changeRole.bind(null, user.id)(e.target.value)}>
        <option value="edit">Edit</option>
        <option value="view">View</option>
      </select>
    </UserRoleCell>
    <UserDeleteCell>
      <Cross src={crossimg} onClick={props.delete.bind(null, user.id)} />
    </UserDeleteCell>
  </UserRow>)

  return(
    <div>
      <UserTable>
        {Users}
        <UserRow>
          <UserNameCell>
            Add another user: 
          </UserNameCell>
          <UserRoleCell>
            <input type="text" value={userName} onChange={e => setUserName(e.target.value)} />
          </UserRoleCell>
          <UserDeleteCell>
            <Plus src={plusimg} onClick={AddOtherUser}/>
          </UserDeleteCell>
        </UserRow>
      </UserTable>
    </div>
  )
}

export default function AddBoard(props) {
  const dispatch = useDispatch();

  const family = useSelector(selectedFamily);

  const [familyName, setFamilyName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // clear the form
    console.log("clear the form");
    if(props.mode === "edit") {
      setFamilyName(family.family_name);
    } else {
      setFamilyName("");
    }
    setFormError("");
  }, [props.show, props.mode, family.family_name, setFamilyName, setFormError]);

  const Submit = () => {
    console.log("Add button clicked", familyName);
    if(familyName === "") {
      // need to throw an error
      //setFormError("Please specify a family group name");
      dispatch(addError("Please specify the family name."));
    } else {
      if(props.mode === "edit") {
        // this is the edit scenario
        dispatch(editFamily({
          family_name: familyName,
          family_id: family.id
        }));
        props.close("edited");
      } else {
        // this is the add scenario
        dispatch(clearBoard());
        dispatch(addFamily({
          family_name: familyName
        }));
        props.close("added");
      }
    }
  }

  const Cancel = () => {
    props.close("cancel");
  }

  const ChangeRole = (id, role) => {
    console.log("change role", id, role);
    dispatch(editOtherUser({
      family_id: family.id,
      other_user_id: id,
      role: role
    }));
  }

  const DeleteOtherUser = (id) => {
    console.log("delete other user", id);
    dispatch(deleteOtherUser({
      family_id: family.id,
      other_user_id: id
    }));
  }

  const AddOtherUser = async (user) => {
    console.log("add other user", user);
    setFormError("");
    // first check for the user
    var resp = await checkUserExists(user);
    console.log("back from search", resp);
    if(resp.status === "error" && resp.reason === "User could not be found") {
      // need to try and create the user
      resp = await inviteNewUser(user);
    }
    if(resp.status === "error") {
      setFormError(resp.reason);
    } else {
      console.log("adding user")
      dispatch(addOtherUser({
        family_id: family.id,
        user_id: resp.id
      }));
      setFormError("");
    }
  }

  const ForwardError = (error) => {
    dispatch(addError(error));
  }

  const HandleKeypress = (e) => {
    if(e.key === "Enter") {
      console.log("captured enter key")
      e.preventDefault();
      Submit();
    }
  }

  return (
    <div>
      <ModalBox show={props.show} close={props.close}>
        <Form>
          <p>{props.mode === "add" ? "Add a" : "Edit"} Family Group</p>
          <Block>
            <label>Family Name:</label>
            <input type="text" value={familyName} onChange={(e) => {setFamilyName(e.target.value)}} onKeyPress={HandleKeypress} autoFocus/>
          </Block>
          {props.mode === "edit" && <div>
            <p style={{marginTop: "10px", marginBottom: "10px"}}>Other Users</p>
            <UserWidget 
              users={family.other_users} 
              changeRole={ChangeRole}
              delete={DeleteOtherUser}
              add={AddOtherUser}
              error={ForwardError}
            />
          </div>}
          {formError && <p ptype="error">{formError}</p>}
          <button type="button" onClick={Submit}>{props.mode === "edit" ? "Edit" : "Add"}</button>
          <button type="button" onClick={Cancel}>Close</button>
        </Form>
      </ModalBox>
    </div>
  )
}