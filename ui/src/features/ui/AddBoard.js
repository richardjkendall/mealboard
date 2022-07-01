import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { 
  selectedFamily,
  addBoard,
  editBoard,
  selectedBoard
} from '../family/familySlice';

import ModalBox from './ModalBox';
import { Form, Block, Checkbox } from './FormWidgets';
import { addError } from './errorSlice';

export default function AddBoard(props) {
  const dispatch = useDispatch();
  const selectedFam = useSelector(selectedFamily);
  const board = useSelector(selectedBoard);

  const [boardName, setBoardName] = useState("");
  const [formError, setFormError] = useState("");
  const [privateBoard, setPrivateBoard] = useState(false);

  useEffect(() => {
    // clear the form
    console.log("clear the form");
    setBoardName(props.mode === "edit" ? board.board_name : "");
    setPrivateBoard(props.mode === "edit" ? board.scope === "private" : false);
    setFormError("");
  }, [props.show, setBoardName, setPrivateBoard, setFormError, props.mode, board.board_name, board.scope]);

  const Submit = () => {
    console.log("Add button clicked", boardName);
    if(boardName === "") {
      // need to throw an error
      dispatch(addError("Please specify a board name."))
    } else {
      if(props.mode === "add") {
        dispatch(addBoard({
          family_id: selectedFam.id,
          board_name: boardName,
          private: privateBoard, 
        }));
        props.close("added");
      } else {
        dispatch(editBoard({
          family_id: selectedFam.id,
          board_id: board.id,
          board_name: boardName,
          private: privateBoard
        }));
        props.close("edited");
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
          <p>{props.mode === "add" ? "Add a" : "Edit"} Board</p>
          <Block>
            <label>Board Name:</label>
            <input type="text" value={boardName} onChange={(e) => {setBoardName(e.target.value)}} />
          </Block>
          <Block>
            <label>Board is private?</label>
            <Checkbox checked={privateBoard} onChange={(e) => {setPrivateBoard(e.target.checked)}} />
          </Block>
          {formError && <p ptype="error">{formError}</p>}
          <button type="button" onClick={Submit}>{props.mode === "add" ? "Add" : "Edit"}</button>
          <button type="button" onClick={Cancel}>Close</button>
        </Form>
      </ModalBox>
    </div>
  )
}