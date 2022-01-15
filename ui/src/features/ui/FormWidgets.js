import styled from 'styled-components';

export const Form = styled.form`
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

export const Block = styled.div`
  label {
    display: inline-block;
    width: 200px;
  }

  input[type="text"] {
    width: 250px;
  }
`