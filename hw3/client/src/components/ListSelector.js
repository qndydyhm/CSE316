import React, { useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import ListCard from './ListCard.js'
import { GlobalStoreContext } from '../store'
import DeleteModal from './DeleteModal'
/*
    This React component lists all the top5 lists in the UI.
    
    @author McKilla Gorilla
*/
const ListSelector = () => {
    const { store } = useContext(GlobalStoreContext);
    store.history = useHistory();

    function handleAddList() {
        store.addList();
    }

    useEffect(() => {
        store.loadIdNamePairs();
    }, []);

    let editStatus = false;
    if (store.isListNameEditActive) {
        editStatus = true;
    }
    let listCard = "";
    if (store) {
        listCard = store.idNamePairs.map((pair) => (
            <ListCard
                key={pair._id}
                idNamePair={pair}
                selected={false}
            />
        ))
    }
    return (
        <div id="top5-list-selector">
            <div id="list-selector-heading">
                <input
                    type="button"
                    id="add-list-button"
                    disabled={editStatus}
                    onClick={handleAddList}
                    className={editStatus?"top5-button-disabled":"top5-button"}
                    value="+" />
                Your Lists
            </div>
            <div id="list-selector-list">
                {
                    listCard
                }
                <DeleteModal />
            </div>
        </div>)
}

export default ListSelector;
