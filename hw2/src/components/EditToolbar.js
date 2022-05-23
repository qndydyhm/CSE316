import React from "react";

export default class EditToolbar extends React.Component {
    doNothing() {}
    render() {
        const {closeCallback, undoCallback, redoCallback, hasUndo, hasRedo, currentList, isEditing} = this.props;
        return (
            <div id="edit-toolbar">
                <div
                    id='undo-button'
                    onClick={hasUndo?undoCallback:this.doNothing}
                    className={(hasUndo&&!isEditing)?"top5-button":"top5-button-disabled"}>
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    onClick={hasRedo?redoCallback:this.doNothing}
                    className={(hasRedo&&!isEditing)?"top5-button":"top5-button-disabled"}>
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    onClick={currentList?closeCallback:this.doNothing}
                    className={(currentList&&!isEditing)?"top5-button":"top5-button-disabled"}>
                        &#x24E7;
                </div>
            </div>
        )
    }
}
