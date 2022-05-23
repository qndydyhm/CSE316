import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { Typography } from '@mui/material'

/*
    Our Status bar React component goes at the bottom of our UI.
    
    @author McKilla Gorilla
*/
function Statusbar() {
    const { store } = useContext(GlobalStoreContext);
    if (store.currentList){
        return (
            <div id="top5-statusbar">
                <Typography variant="h4">{store.currentList.name}</Typography>
            </div>
        );
    }
    else {
        return (<div></div>);
    }
}

export default Statusbar;
