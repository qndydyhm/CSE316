import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';

export default function Alerts() {
    const { store } = useContext(GlobalStoreContext);

    let msg = "";
    let alertSatus = false;
    if (store.alertMessage) {
        msg = store.alertMessage;
    }
    if (store.alertSatus) {
        alertSatus = true;
    }


  return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={alertSatus} id='collapse'>
        <Alert id='alert'
            severity="error"
            action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                store.hideAlert();
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
        {msg}
        </Alert>
      </Collapse>
    </Box>
  );
}
