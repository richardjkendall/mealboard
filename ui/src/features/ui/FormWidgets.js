import { useState } from 'react';
import styled from 'styled-components';

export const Form = styled.form`
  p:first-child {
    margin-top: 0px;
    font-weight: bold;
  }

  p[ptype="error"] {
    color: red;
  }

  button {
    color: #ffffff;
    background-color: #2196f3;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
  }

  button:hover {
    transform: translate(-1px, -1px);
    box-shadow: 2px 2px #cccccc;
    background-color: #0d8bf2;
  }

  button:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }

  button:last-child {
    margin-top: 10px;
  }

  button:not(:nth-of-type(1)) {
    margin-left: 10px;
  }
`

export const Block = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;

  label {
    display: inline-block;
    width: 150px;
  }

  input {
    border: solid 1px #cccccc;
  }

  input[type="text"] {
    width: 250px;
    padding: 2px;
    padding-left: 4px;
  }

  input[type="checkbox"] {
    margin: 0px;
    width: 15px;
    height: 15px;
  }
`

const CheckboxContainer = styled.label`
  display: inline-block;
  position: relative;
  cursor: pointer;

  top: -13px;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    background-color: #f1f1f1;
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  &:hover input ~ .checkmark {
    background-color: #ccc;
  }

  input:checked ~ .checkmark {
    background-color: #2196f3;
  }

  input:checked ~ .checkmark:after {
    display: block;
  }
`

export const Checkbox = (props) => {
  return (
    <CheckboxContainer>
      <input type="checkbox" {...props} />
      <span className="checkmark"></span>
    </CheckboxContainer>
  )
}

const ColourPickerBox = styled.div`
  border-radius: 4px;
  background-color: #f1f1f1;
  border: none;

  height: 20px;
  width: 40px;

  cursor: pointer;

  &:hover {
    background-color: #cccccc;
  }

  p {
    display: inline-block;
    margin: 0px;
    margin-left: 5px;
  }
`

const ColourSwatch = styled.div`
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: white;
  border: 1px solid black;
  
  margin-top: 4px;
  margin-left: 6px;
`

const ColourPickerDropDown = styled.div`
  position: relative;
  top: 2px;
  height: 150px;
  width: 150px;
  z-index: 30;
  background-color: #f1f1f1;
`

export const ColourDropDown = (props) => {

  const [open, setOpen] = useState(false);

  return (
    <ColourPickerBox onClick={() => setOpen(!open)}>
      <ColourSwatch/>
      <p>&#9660;</p>
      {open && <ColourPickerDropDown/>}
    </ColourPickerBox>
  )
}