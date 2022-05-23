import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext);
    const [editActive, setEditActive] = useState(false);
    const [draggedTo, setDraggedTo] = useState(0);

    function handleToggleEdit(event) {
        event.stopPropagation();
        toggleEdit();
    }

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsItemEditActive();
        }
        setEditActive(newActive);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            let id = event.target.id.substring(event.target.id.indexOf("-")+1);
            if (props.text !== event.target.value) {
                console.log(id)
                store.addUpdateItemTransaction(id, event.target.value);
            }
            toggleEdit();
        }
        store.updateCurrentList();
    }

    function handleOnblur(event) {
        let id = event.target.id.substring(event.target.id.indexOf("-")+1);
        if (props.text !== event.target.value) {
            //store.addChangeItemTransaction(id, props.text, event.target.value);
        }
        toggleEdit();
    }

    function handleDragStart(event, targetId) {
        event.dataTransfer.setData("item", targetId);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
        console.log("entering");
        setDraggedTo(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        console.log("leaving");
        setDraggedTo(false);
    }

    function handleDrop(event, targetId) {
        event.preventDefault();
        let sourceId = event.dataTransfer.getData("item");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        setDraggedTo(false);

        console.log("handleDrop (sourceId, targetId): ( " + sourceId + ", " + targetId + ")");

        // UPDATE THE LIST
        store.addMoveItemTransaction(sourceId, targetId);
        store.updateCurrentList();
    }

    let { index } = props;

    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }

    function donothing(){}

    let editStatus = false;
    if (store.isItemEditActive) {
        editStatus = true;
        console.log(editStatus);
    }

    if (!editActive) {
        return (
                <ListItem
                    id={'item-' + (index+1)}
                    key={props.key}
                    className={itemClass}
                    onDragStart={(event) => {
                        if (!editStatus) {
                            handleDragStart(event, (index+1));
                        }
                    }}
                    onDragOver={(event) => {
                        if (!editStatus) {
                            handleDragOver(event, (index+1));
                        }
                    }}
                    onDragEnter={(event) => {
                        if (!editStatus) {
                            handleDragEnter(event, (index+1));
                        }
                    }}
                    onDragLeave={(event) => {
                        if (!editStatus) {
                            handleDragLeave(event, (index+1));
                        }
                    }}
                    onDrop={(event) => {
                        if (!editStatus) {
                            handleDrop(event, (index+1));
                        }
                    }}
                    draggable={!editStatus}
                    sx={{ display: 'flex', p: 1 }}
                    style={{
                        fontSize: '48pt',
                        width: '100%'
                    }}
                >
                <Box sx={{ p: 1 }}>
                    <IconButton aria-label='edit' disabled={editStatus} onClick={editStatus?donothing:handleToggleEdit}>
                        <EditIcon style={{fontSize:'48pt'}}  />
                    </IconButton>
                </Box>
                    <Box sx={{ p: 1, flexGrow: 1 }}>{props.text}</Box>
                </ListItem>
        )
    }
    else {
        return (<TextField
                    id={'item-' + (index+1)}
                    className='top5-item-editting'
                    type='text'
                    onKeyPress={handleKeyPress}
                    defaultValue={props.text}
                >
                </TextField>
        )
    }
}

export default Top5Item;
