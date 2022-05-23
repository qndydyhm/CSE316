import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    function doNothing () {
    }
    function handleUndo() {
        store.undo();
        store.updateCurrentList();
    }
    function handleRedo() {
        store.redo();
        store.updateCurrentList();
    }
    function handleClose() {
        history.push("/");
        store.closeCurrentList();
    }
    let editStatus = false;
    if (store.isListNameEditActive) {
        editStatus = true;
    }
    let hasUndo = false;
    if (store.hasUndo) {
        hasUndo = true;
    }
    let hasRedo = false;
    if (store.hasRedo) {
        hasRedo = true;
    }
    let isOpen = false;
    if (store.isOpen) {
        isOpen = true;
    }
    return (
        <div id="edit-toolbar">
            <div
                id='undo-button'
                onClick={editStatus||!hasUndo?doNothing:handleUndo}
                className={(editStatus||!hasUndo)?"top5-button-disabled":"top5-button"}>
                &#x21B6;
            </div>
            <div
                id='redo-button'
                onClick={editStatus||!hasRedo?doNothing:handleRedo}
                className={(editStatus||!hasRedo)?"top5-button-disabled":"top5-button"}>
                &#x21B7;
            </div>
            <div
                id='close-button'
                onClick={editStatus||!isOpen?doNothing:handleClose}
                className={editStatus||!isOpen?"top5-button-disabled":"top5-button"}>
                &#x24E7;
            </div>
        </div>
    )
}

export default EditToolbar;
