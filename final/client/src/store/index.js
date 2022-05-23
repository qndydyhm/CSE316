import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import api from '../api'
import AuthContext from '../auth'
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    //LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    UNMARK_LIST_FOR_DELETION: "UNMARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SHOW_ALERT: "SHOW_ALERT",
    HIDE_ALERT: "HIDE_ALERT",
    LOAD_HOME_VIEW: "LOAD_HOME_VIEW",
    LOAD_GROUP_VIEW: "LOAD_GROUP_VIEW",
    LOAD_USER_VIEW: "LOAD_USER_VIEW",
    LOAD_COMMUNITY_VIEW: "LOAD_COMMUNITY_VIEW",
    FILT_LIST: "FILT_LIST",
    SORT_LIST: "SORT_LIST",
    LOG_OUT: "LOG_OUT",
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        totalNamePairs: [],
        idNamePairs: [],
        currentList: null,
        currentState: 0,
        newListCounter: 0,
        listMarkedForDeletion: null,
        alertMessage: "",
        alertSatus: false,
        search: '',
        valid: false,
    });
    const history = useHistory();

    // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
    const { auth } = useContext(AuthContext);

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    totalNamePairs: store.totalNamePairs,
                    idNamePairs: store.idNamePairs,
                    currentState: 1,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: store.search,
                    valid: false,
                })
            }
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                return setStore({
                    totalNamePairs: store.totalNamePairs,
                    idNamePairs: store.idNamePairs,
                    currentState: 1,
                    currentList: payload,
                    newListCounter: store.newListCounter + 1,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: store.search,
                    valid: false,
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            /*case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentState: store.listState,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                });
            }*/
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    totalNamePairs: store.totalNamePairs,
                    idNamePairs: store.idNamePairs,
                    currentState: store.listState,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: payload,
                    alertMessage: "",
                    alertSatus: false,
                    search: store.search,
                    valid: false,
                });
            }
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.UNMARK_LIST_FOR_DELETION: {
                return setStore({
                    totalNamePairs: store.totalNamePairs,
                    idNamePairs: store.idNamePairs,
                    currentState: store.listState,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: store.search,
                    valid: false,
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    totalNamePairs: store.totalNamePairs,
                    idNamePairs: store.idNamePairs,
                    currentState: store.listState,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: store.search,
                    valid: false,
                });
            }
            case GlobalStoreActionType.SHOW_ALERT: {
                return setStore({
                    totalNamePairs: store.totalNamePairs,
                    idNamePairs: store.idNamePairs,
                    currentState: store.listState,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: false,
                    alertMessage: payload,
                    alertSatus: true,
                    search: store.search,
                    valid: false,
                });
            }
            case GlobalStoreActionType.HIDE_ALERT: {
                return setStore({
                    totalNamePairs: store.totalNamePairs,
                    idNamePairs: store.idNamePairs,
                    currentState: store.listState,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: store.listMarkedForDeletion,
                    alertMessage: "",
                    alertSatus: false,
                    search: store.search,
                    valid: false,
                });
            }
            case GlobalStoreActionType.LOAD_HOME_VIEW: {
                return setStore({
                    totalNamePairs: payload,
                    idNamePairs: payload,
                    currentState: 1,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: null,
                    valid: false,
                });
            }
            case GlobalStoreActionType.LOAD_GROUP_VIEW: {
                return setStore({
                    totalNamePairs: payload,
                    idNamePairs: payload,
                    currentState: 2,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: null,
                    valid: false,
                });
            }
            case GlobalStoreActionType.LOAD_USER_VIEW: {
                return setStore({
                    totalNamePairs: payload,
                    idNamePairs: [],
                    currentState: 3,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: null,
                    valid: false,
                });
            }
            case GlobalStoreActionType.LOAD_COMMUNITY_VIEW: {
                return setStore({
                    totalNamePairs: payload,
                    idNamePairs: payload,
                    currentState: 4,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: null,
                    valid: false,
                });
            }
            case GlobalStoreActionType.FILT_LIST: {
                return setStore({
                    totalNamePairs: store.totalNamePairs,
                    idNamePairs: payload.pairs,
                    currentState: store.currentState,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: payload.search,
                    valid: false,
                });
            }
            case GlobalStoreActionType.SORT_LIST: {
                return setStore({
                    totalNamePairs: payload.totalLists,
                    idNamePairs: payload.lists,
                    currentState: store.currentState,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: store.search,
                    valid: false,
                });
            }
            case GlobalStoreActionType.CHECK_VALID: {
                return setStore({
                    totalNamePairs: store.totalLists,
                    idNamePairs: store.idNamePairs,
                    currentState: store.currentState,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: store.listMarkedForDeletion,
                    alertMessage: "",
                    alertSatus: false,
                    search: "",
                    valid: payload,
                });
            }
            case GlobalStoreActionType.LOG_OUT: {
                return setStore({
                    totalNamePairs: [],
                    idNamePairs: [],
                    currentState: 0,
                    currentList: null,
                    newListCounter: 0,
                    listMarkedForDeletion: null,
                    alertMessage: "",
                    alertSatus: false,
                    search: "",
                    valid: false,
                });
            }
            default:
                return store;
        }
    }
    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        history.push("/");
    }

    // THIS FUNCTION CREATES A NEW LIST
    store.createNewList = async function () {
        let newListName = "Untitled" + store.newListCounter;
        let payload = {
            name: newListName,
            items: ["?", "?", "?", "?", "?"],
            published: false,
           };
        try {
            const response = await api.createTop5List(payload);
            if (response.data.success) {
                let newList = response.data.top5List;
                storeReducer({
                    type: GlobalStoreActionType.CREATE_NEW_LIST,
                    payload: newList
                }
                );
                // IF IT'S A VALID LIST THEN LET'S START EDITING IT
                history.push("/top5list/" + newList._id);
            }
            else {
                console.log("API FAILED TO CREATE A NEW LIST");
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = async function () {
        if (auth.user && auth.user.name !== 'Guest') {
            await store.loadHomeView();
        }
        else {
            await store.loadGroupView();
        }
    }

    store.loadHomeView = async function() {
        try {
            const response = await api.getTop5Lists();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs.filter( list => list.owner === auth.user.name);
                storeReducer({
                    type: GlobalStoreActionType.LOAD_HOME_VIEW,
                    payload: pairsArray,
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
        document.getElementById('search').value = ''
        history.push('/');
    }

    store.loadGroupView = async function() {
        try {
            const response = await api.getTop5Lists();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs.filter( list => list.published && list.owner !== 'Community');
                storeReducer({
                    type: GlobalStoreActionType.LOAD_GROUP_VIEW,
                    payload: pairsArray,
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
        document.getElementById('search').value = ''
        history.push('/');
    }

    store.loadUserView = async function() {
        try {
            const response = await api.getTop5Lists();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs.filter( list => list.published && list.owner !== 'Community');
                storeReducer({
                    type: GlobalStoreActionType.LOAD_USER_VIEW,
                    payload: pairsArray,
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
        document.getElementById('search').value = ''
        history.push('/');
    }

    store.loadCommunityView = async function() {
        try {
            const response = await api.getCommunityLists();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs.filter( list => list.owner === 'Community');
                storeReducer({
                    type: GlobalStoreActionType.LOAD_COMMUNITY_VIEW,
                    payload: pairsArray,
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
        document.getElementById('search').value = ''
        history.push('/');
    }

    store.logout = async function() {
        storeReducer({
            type: GlobalStoreActionType.LOG_OUT,
            payload: null,
        });
    }

    store.filter = async function(str) {
        let string = str;
        str = str.toUpperCase();
        let lists = store.totalNamePairs;
        if (store.currentState !== 3) {
            lists = lists.filter( list => list.name.toUpperCase().startsWith(str));
        }
        else if (!str) {
            lists = [];
        }
        else {
            lists = lists.filter( list => list.owner.toUpperCase().startsWith(str));
        }
        storeReducer({
            type: GlobalStoreActionType.FILT_LIST,
            payload: {
                pairs: lists,
                search: string,
            }
        });
    }

    store.sort = async function(num) {
        let totalLists = store.totalNamePairs;
        let lists = store.idNamePairs;
        if (num === 0) {
            totalLists.sort( function(a, b) {
                if (a.publishedAt[0] > b.publishedAt[0]) {
                    return true;
                }
                else if (a.publishedAt[0] < b.publishedAt[0]) {
                    return false;
                }
                else {
                    if (a.publishedAt[1] > b.publishedAt[1]) {
                        return true;
                    }
                    else if (a.publishedAt[1] < b.publishedAt[1]) {
                        return false;
                    }
                    else {
                        if (a.publishedAt[2] >= b.publishedAt[2]) {
                            return true;
                        }
                        else{
                            return false;
                        }
                    }
                }
            })
            lists.sort( function(a, b) {
                if (a.publishedAt[0] > b.publishedAt[0]) {
                    return true;
                }
                else if (a.publishedAt[0] < b.publishedAt[0]) {
                    return false;
                }
                else {
                    if (a.publishedAt[1] > b.publishedAt[1]) {
                        return true;
                    }
                    else if (a.publishedAt[1] < b.publishedAt[1]) {
                        return false;
                    }
                    else {
                        if (a.publishedAt[2] >= b.publishedAt[2]) {
                            return true;
                        }
                        else{
                            return false;
                        }
                    }
                }
            })
        }
        if (num === 1) {
            totalLists.sort( function(a, b) {
                if (a.publishedAt[0] < b.publishedAt[0]) {
                    return true;
                }
                else if (a.publishedAt[0] > b.publishedAt[0]) {
                    return false;
                }
                else {
                    if (a.publishedAt[1] < b.publishedAt[1]) {
                        return true;
                    }
                    else if (a.publishedAt[1] > b.publishedAt[1]) {
                        return false;
                    }
                    else {
                        if (a.publishedAt[2] <= b.publishedAt[2]) {
                            return true;
                        }
                        else{
                            return false;
                        }
                    }
                }
            })
            lists.sort( function(a, b) {
                if (a.publishedAt[0] < b.publishedAt[0]) {
                    return true;
                }
                else if (a.publishedAt[0] > b.publishedAt[0]) {
                    return false;
                }
                else {
                    if (a.publishedAt[1] < b.publishedAt[1]) {
                        return true;
                    }
                    else if (a.publishedAt[1] > b.publishedAt[1]) {
                        return false;
                    }
                    else {
                        if (a.publishedAt[2] <= b.publishedAt[2]) {
                            return true;
                        }
                        else{
                            return false;
                        }
                    }
                }
            })
        }
        if (num === 2) {
            totalLists.sort( (a,b) => b.views - a.views);
            lists.sort( (a,b) => b.views - a.views);
        }
        if (num === 3) {
            totalLists.sort( (a,b) => b.likes - a.likes);
            lists.sort( (a,b) => b.likes - a.likes);
        }
        if (num === 4) {
            totalLists.sort( (a,b) => b.dislikes - a.dislikes);
            lists.sort( (a,b) => b.dislikes - a.dislikes);
        }
        storeReducer({
            type: GlobalStoreActionType.SORT_LIST,
            payload: {
                totalLists: totalLists,
                lists: lists,
            }
        })

    }



    // THE FOLLOWING 5 FUNCTIONS ARE FOR COORDINATING THE DELETION
    // OF A LIST, WHICH INCLUDES USING A VERIFICATION MODAL. THE
    // FUNCTIONS ARE markListForDeletion, deleteList, deleteMarkedList,
    // showDeleteListModal, and hideDeleteListModal
    store.markListForDeletion = async function (id) {
        try {
            // GET THE LIST
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                storeReducer({
                    type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                    payload: top5List
                });
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }

    store.deleteList = async function (listToDelete) {
        try {
            let response = await api.deleteTop5ListById(listToDelete._id);
            if (response.data.success) {
                store.loadIdNamePairs();
                history.push("/");
            }
        }
        catch (err) {
            store.unmarkListForDeletion();
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }

    store.deleteMarkedList = function () {
        store.deleteList(store.listMarkedForDeletion);
    }

    store.unmarkListForDeletion = function () {
        storeReducer({
            type: GlobalStoreActionType.UNMARK_LIST_FOR_DELETION,
            payload: null
        });
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = async function (id) {
        try {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                //response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    history.push("/top5list/" + top5List._id);
                }
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }

    store.checkValid = async function () {
            let body = {
                name: document.getElementById("list-name").value,
                items: [
                    document.getElementById("item-1").value,
                    document.getElementById("item-2").value,
                    document.getElementById("item-3").value,
                    document.getElementById("item-4").value,
                    document.getElementById("item-5").value,
                ]
            };
        let valid = true;
        if (!body.name || !body.items[0] || !body.items[1] || !body.items[2] || !body.items[3] || !body.items[4]) {
            valid = false;
    }
    if (body.items[0] === body.items[1] || body.items[0] === body.items[2] || body.items[0] === body.items[3] || body.items[0] === body.items[4] || body.items[1] === body.items[2] || body.items[1] === body.items[3] || body.items[1] === body.items[4] || body.items[2] === body.items[3] || body.items[2] === body.items[4] || body.items[3] === body.items[4]) {
            valid = false;
        }
        storeReducer({
            type: GlobalStoreActionType.CHECK_VALID,
            payload: valid,
        });
    }

    store.updateCurrentList = async function () {
        try {
            let payload = {
                name: document.getElementById("list-name").value,
                items: [
                    document.getElementById("item-1").value,
                    document.getElementById("item-2").value,
                    document.getElementById("item-3").value,
                    document.getElementById("item-4").value,
                    document.getElementById("item-5").value,
                ]
            };
            const response = await api.updateTop5ListById(store.currentList._id, payload);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }

    store.publishCurrenList = async function () {
        try {
            let payload = {
                name: document.getElementById("list-name").value,
                items: [
                    document.getElementById("item-1").value,
                    document.getElementById("item-2").value,
                    document.getElementById("item-3").value,
                    document.getElementById("item-4").value,
                    document.getElementById("item-5").value,
                ]
            };
            const response = await api.publishTop5ListById(store.currentList._id, payload);
            console.log(response);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
            else {
                console.log("API FAILED TO PUBLISH A NEW LIST");
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch{}
        }
    }



    store.showAlert = function (msg) {
        storeReducer({
            type: GlobalStoreActionType.SHOW_ALERT,
            payload: msg
        });
    }

    store.hideAlert = function () {
        storeReducer({
            type: GlobalStoreActionType.HIDE_ALERT,
            payload: null
        });
    }

    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
