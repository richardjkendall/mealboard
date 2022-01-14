import React, { useState, useEffect } from 'react';
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
  padding: 10px;
  z-index: 20;
`

export default function ModalBox(props) {

  const CloseBox = (reason) => {
    props.close(reason);
  }

  return (
    props.show && <Blockout onClick={props.allowBackgroundClose && CloseBox.bind(null, "cancel")}>
      <CentreBox>
        {props.children}
      </CentreBox>
    </Blockout>
  )
}