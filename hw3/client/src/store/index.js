import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import Change_Transaction from '../transactions/ChangeItem_Transaction';
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_LIST_ITEM_EDIT_ACTIVE: "SET_LIST_ITEM_EDIT_ACTIVE"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false,
        itemActive: false,
        listMarkedForDeletion: null,
        hasUndo: false,
        hasRedo: false,
        isOpen: false,
        isEdit: false
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false,
                    isOpen: false,
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false,
                    isOpen: false,
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false,
                    isOpen: false,
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: tps.hasTransactionToUndo(),
                    hasRedo: tps.hasTransactionToRedo(),
                    isOpen: true,
                });
            }
            case GlobalStoreActionType.SET_LIST_ITEM_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false,
                    isOpen: true
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false,
                    isOpen: false,
                });
            }
            case GlobalStoreActionType.SET_LIST_TO_DELETE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    listMarkedForDeletion: payload,
                    hasUndo: false,
                    hasRedo: false,
                    isOpen: false
                });
            }
            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                if (newName == "")
                    newName = ' ';
                top5List.name = newName;
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        top5List: top5List
                                    }
                                });
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
    }

    store.addList = function () {
        async function asyncAddList() {
            let name = 'Untitled' + store.newListCounter;
            store.newListCounter += 1;
            let payload = {"name": name,"items":["","","","",""]};
            let response = await api.createTop5List(payload);
            if (response.data.success) {
                async function getListPairs(top5List) {
                    let response = await api.getTop5ListPairs();
                    if (response.data.success) {
                        storeReducer({
                            type: GlobalStoreActionType.SET_CURRENT_LIST,
                            payload: top5List
                        });
                        store.history.push("/top5list/" + top5List._id);
                    }
                }
                getListPairs(response.data.top5List);
            }
        }
        asyncAddList();
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            try {
                const response = await api.getTop5ListPairs();
                if (response.data.success) {
                    let pairsArray = response.data.idNamePairs;
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: pairsArray
                    });
                }
                else {
                    console.log("API FAILED TO GET THE LIST PAIRS");
                }
            }
            catch {
                console.log("API FAILED TO GET THE LIST PAIRS");
                storeReducer({
                    type:GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: []
                });
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }

    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
    }
    store.addChangeItemTransaction = function (index, oldText, newText) {
        let transaction = new Change_Transaction(store, index, oldText, newText);
        tps.addTransaction(transaction);
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
    }
    store.changeItem = function (index, text) {
        store.currentList.items[index-1] = text;
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    store.setIsListItemEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_ITEM_EDIT_ACTIVE,
            payload: null
        });
    }

    store.showDeleteModal = function (id) {
        async function asyncSetDeleteList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let listToDelete = response.data.top5List;
                storeReducer( {
                    type: GlobalStoreActionType.SET_LIST_TO_DELETE,
                    payload: listToDelete
                });
                let modal = document.getElementById('delete-modal');
                modal.classList.add('is-visible');
            }
        }
        asyncSetDeleteList(id);
    }

    store.hideDeleteListModal = function () {
        let modal = document.getElementById('delete-modal');
        modal.classList.remove('is-visible');
        store.closeCurrentList();
    }

    store.deleteMarkedList = function () {
        async function asyncDeleteMarkedList(id) {
            let response = await api.deleteTop5ListById(id);
            if (response.data.success) {
                async function getListPairs() {
                    let response = await api.getTop5ListPairs();
                    if (response.data.success) {
                        let pairsArray = response.data.idNamePairs;
                        storeReducer({
                            type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                            payload: pairsArray
                        });
                    }
                }
                store.loadIdNamePairs();
                let modal = document.getElementById('delete-modal');
                modal.classList.remove("is-visible");
            }
        }
        asyncDeleteMarkedList(store.listMarkedForDeletion._id);
    }


    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}
