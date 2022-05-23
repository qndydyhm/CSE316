import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        const {title, closeCallback, undoCallback, redoCallback, hasUndo, hasRedo, currentList, isEditing} = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar
                    closeCallback={closeCallback}
                    undoCallback={undoCallback}
                    redoCallback={redoCallback}
                    hasUndo={hasUndo}
                    hasRedo={hasRedo}
                    isEditing={isEditing}
                    currentList={currentList}/>
            </div>
        );
    }
}
