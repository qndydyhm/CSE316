import { React, useContext } from "react";
import { GlobalStoreContext } from '../store'
import TextField from '@mui/material/TextField';
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    let { index } = props;
    const { store } = useContext(GlobalStoreContext);

    async function handleOnChange() {
        store.checkValid();
    }

    return (
        <TextField
            id={'item-' + (index+1)}
            key={props.key}
            className='top5-item-editting'
            type='text'
            onChange={handleOnChange}
            defaultValue={props.text}
        />
    );
}

export default Top5Item;
