import { React, useContext, useState } from 'react';
import { GlobalStoreContext } from '../store';
import { styled, Box } from '@mui/system';
import ModalUnstyled from '@mui/core/ModalUnstyled';
import Button from '@mui/material/Button';

const StyledModal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled('div')`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const style = {
  width: 400,
  bgcolor: '#ddd',
  border: '2px solid #000',
  p: 2,
  px: 4,
  pb: 3,
};

export default function ModalUnstyledDemo() {
    const { store } = useContext(GlobalStoreContext);

    let msg = "";
    let deleteStatus = false;
    if (store.listMarkedForDeletion) {
        msg = "Are you sure to delete list " + store.listMarkedForDeletion.name + "?";
        deleteStatus = true;
    }

    async function handleConfirm() {
        store.deleteMarkedList();
    }

    async function handleCancle() {
        store.unmarkListForDeletion();
    }

  return (
    <div>
      <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={deleteStatus}
        onClose={handleCancle}
        BackdropComponent={Backdrop}
      >
        <Box sx={style}>
          <h2 id="unstyled-modal-title">Double Check</h2>
          <p id="unstyled-modal-description">{msg}</p>
          <Button onClick={handleConfirm}>Confirm</Button>
          <Button onClick={handleCancle}>Cancle</Button>
        </Box>
      </StyledModal>
    </div>
  );
}
