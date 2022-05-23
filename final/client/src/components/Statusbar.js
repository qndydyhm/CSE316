import React, { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { Typography, Fab } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

/*
    Our Status bar React component goes at the bottom of our UI.
    
    @author McKilla Gorilla
*/

function Statusbar() {
    const { store } = useContext(GlobalStoreContext);
    function handleCreateNewList() {
        store.createNewList();
}
    /*if (store.currentList){
        return (
            <div id="top5-statusbar">
                <Typography variant="h4">{store.currentList.name}</Typography>
            </div>
        );
    }
    else {
        return (<div></div>);
    }*/
    if (store.currentState === 1) {
        return(
            <div id="top5-statusbar">
            <Fab 
                color="primary" 
                aria-label="add"
                id="add-list-button"
                onClick={handleCreateNewList}
            >
                <AddIcon />
            </Fab>
                <Typography variant="h2">Your Lists</Typography>
            </div>
        );
    }
    else if (store.currentState === 2){
        return(
            <div id='top5-statusbar'>
                <Typography variant="h4">{((store.search)?store.search:'All') + ' Lists'}</Typography>
            </div>
        );
    }
    else if (store.currentState === 3){
        return(
            <div id='top5-statusbar'>
                <Typography variant="h4">{((store.search)?store.search:'User') + ' Lists'}</Typography>
            </div>
        );
    }
    else if (store.currentState === 4){
        return(
            <div id='top5-statusbar'>
                <Typography variant="h4">{((store.search)?store.search:'Community') + ' Lists'}</Typography>
            </div>
        );
    }
    else{
        return <div></div>;
    }
}

export default Statusbar;
