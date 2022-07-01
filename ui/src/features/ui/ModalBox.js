import React from 'react';
import styled from 'styled-components';

const Blockout = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background: rgba(51, 51, 51, 0.7);
  z-index: 10;
`

const CentreBox = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 5px 5px 10px darkgrey;
  padding: 15px;
  z-index: 20;
`

export default function ModalBox(props) {

  const CloseBox = (reason) => {
    props.close(reason);
  }

  const HandleClick = (e) => {
    if(props.allowBackgroundClose) {
      CloseBox("cancel");
    } else {
      e.stopPropagation();
    }
  }

  return (
    props.show && <Blockout onClick={HandleClick}>
      <CentreBox>
        {props.children}
      </CentreBox>
    </Blockout>
  )
}