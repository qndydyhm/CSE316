import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { Button, TextField} from '@mui/material';
import CloseIcon from '@mui/icons-material/HighlightOff';

/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);

    function handleSave() {
        store.updateCurrentList();
    }

    function handlePublish() {
        store.publishCurrenList();
    }

    function handleClose() {
        store.closeCurrentList();
    }

    function handleOnChange() {
        store.checkValid();
    }

    let valid = true;
    if (store.valid) {
        valid = false;
    }


    return (
        <div id="edit-toolbar">
            <TextField
                id='list-name'
                onChange={handleOnChange}
                defaultValue={store.currentList.name}
            />
            <Button 
                id='save-button'
                onClick={handleSave}
                variant="contained">
                    Save
            </Button>
            <Button 
                id='publish-button'
                onClick={handlePublish}
                disabled={valid}
                variant="contained">
                    Publish
            </Button>
            <Button 
                id='close-button'
                onClick={handleClose}
                variant="contained">
                    <CloseIcon />
            </Button>
        </div>
    )
}

export default EditToolbar;
