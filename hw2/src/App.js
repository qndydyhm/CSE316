import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS';
import RenameItem from './common/RenameItemTransaction';
import MoveItem from './common/MoveItem_Transaction';


// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        this.tps = new jsTPS();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            listKeyPairMarkedForDeletion: null,
            sessionData : loadedSessionData,
            hasUndo: false,
            hasRedo: false,
            isEditing: false
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;

        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList && currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    addRenameItemTransaction = (index, newText) => {
        let oldText = this.state.currentList.items[index];
        let transaction = new RenameItem(this, index, oldText, newText);
        this.tps.addTransaction(transaction);
        this.setState({hasUndo: this.tps.hasTransactionToUndo()});
        this.setState({hasRedo: this.tps.hasTransactionToRedo()});
    }
    addMoveItemTransaction = (oldIndex, newIndex) => {
        let transaction = new MoveItem(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
        this.setState({hasUndo: this.tps.hasTransactionToUndo()});
        this.setState({hasRedo: this.tps.hasTransactionToRedo()});
    }
    undo = () => {
        if (this.state.hasUndo) {
            this.tps.undoTransaction();
            this.updateState();
        }
    }
    redo = () => {
        if (this.state.hasRedo) {
            this.tps.doTransaction();
            this.updateState();
        }
    }
    handleKeydown = (event) => {
        if (this.state.hasUndo && event.ctrlKey && (event.key === "z" || event.key === "Z")) {
            this.undo();
        }
        if (this.state.hasRedo && event.ctrlKey && (event.key === "y" || event.key === "Y")) {
            this.redo();
        }
    }

    renameItem = (index, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME

        let currentList = this.state.currentList;
        currentList.items[index] = newName;

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            let list = this.db.queryGetList(this.state.currentList.key);
            list.items[index] = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    moveItem = (oldIndex, newIndex) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];

        let currentList = this.state.currentList;
        currentList.items.splice(newIndex, 0, currentList.items.splice(oldIndex, 1)[0]);

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            let list = this.db.queryGetList(this.state.currentList.key);
            list.items.splice(newIndex, 0, list.items.splice(oldIndex, 1)[0]);
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        if (!this.state.currentList || key !== this.state.currentList.key) {
            let newCurrentList = this.db.queryGetList(key);
            this.setState(prevState => ({
                currentList: newCurrentList,
                sessionData: prevState.sessionData
            }), () => {
                // ANY AFTER EFFECTS?
                this.tps.clearAllTransactions();
                this.updateState();
            });
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
            this.tps.clearAllTransactions();
            this.updateState();
        });
    }
    updateState = () => {
        this.setState({hasUndo: this.tps.hasTransactionToUndo()});
        this.setState({hasRedo: this.tps.hasTransactionToRedo()});
    }
    deleteList = () => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        let keyPair = this.state.listKeyPairMarkedForDeletion;

        console.log("state: " + keyPair.name);

        for (let i = 0; i < newKeyNamePairs.length; i ++) {
            let pair = newKeyNamePairs[i];
            if (keyPair.key === pair.key) {
                newKeyNamePairs.splice(i, 1);
                i --;
            }
        }

        let currentList = this.state.currentList;
        if (currentList && currentList.key === keyPair.key) {
            currentList = null;
        }

        this.setState(prevState => ({
            currentList: currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs}
        }), () => {
            let list = this.db.queryGetList(keyPair.key);
            this.db.mutationDeleteList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = (keyPair) => {
        console.log("keyPair: " + keyPair.name);
        this.setState({listKeyPairMarkedForDeletion: keyPair});
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    setEditStatus = (bool) => {
        this.setState({isEditing: bool});
    }
    render() {
        return (
            <div id="app-root" onKeyDown={this.handleKeydown} tabIndex={-1}>
                <Banner
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    hasUndo={this.state.hasUndo}
                    hasRedo={this.state.hasRedo}
                    isEditing={this.state.isEditing}
                    currentList={this.state.currentList}/>
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.showDeleteListModal}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    isEditing={this.state.isEditing}
                    setEditStatusCallback={this.setEditStatus} />
                <Workspace
                    currentList={this.state.currentList}
                    renameItemCallback={this.addRenameItemTransaction}
                    moveItemCallback={this.addMoveItemTransaction}
                    isEditing={this.state.isEditing}
                    setEditStatusCallback={this.setEditStatus} />
                <Statusbar
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteList}/>
            </div>
        );
    }
}

export default App;
