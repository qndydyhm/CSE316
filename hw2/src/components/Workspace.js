import React from "react";
import ListItem from "./ListItem";

export default class Workspace extends React.Component {
    render() {
        const {currentList, renameItemCallback, moveItemCallback, setEditStatusCallback, isEditing} = this.props;
        let items = ["","","","",""];
        let keyValue = -1;
        if (currentList) {
            items = currentList.items;
            keyValue = currentList.key;
        }
        else {
            items = ["","","","",""];
            keyValue = -1;
        }
        return (
            <div id="top5-workspace">
                <div id="workspace-edit">
                    <div id="edit-numbering">
                        <div className="item-number">1.</div>
                        <div className="item-number">2.</div>
                        <div className="item-number">3.</div>
                        <div className="item-number">4.</div>
                        <div className="item-number">5.</div>
                    </div>
                    <div id="edit-items">
                        <ListItem index={0} text={items[0]} renameItemCallback={renameItemCallback} moveItemCallback={moveItemCallback} keyValue={keyValue} setEditStatusCallback={setEditStatusCallback} isEditing={isEditing}/>
                        <ListItem index={1} text={items[1]} renameItemCallback={renameItemCallback} moveItemCallback={moveItemCallback} keyValue={keyValue} setEditStatusCallback={setEditStatusCallback} isEditing={isEditing}/>
                        <ListItem index={2} text={items[2]} renameItemCallback={renameItemCallback} moveItemCallback={moveItemCallback} keyValue={keyValue} setEditStatusCallback={setEditStatusCallback} isEditing={isEditing}/>
                        <ListItem index={3} text={items[3]} renameItemCallback={renameItemCallback} moveItemCallback={moveItemCallback} keyValue={keyValue} setEditStatusCallback={setEditStatusCallback} isEditing={isEditing}/>
                        <ListItem index={4} text={items[4]} renameItemCallback={renameItemCallback} moveItemCallback={moveItemCallback} keyValue={keyValue} setEditStatusCallback={setEditStatusCallback} isEditing={isEditing}/>
                    </div>
                </div>
            </div>
        )
    }
}
