import React from "react";

export default class ListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index: this.props.index,
            editActive: false,
            isOver: false,
        }
    }
    handleClick = (event) => {
        if (!this.props.isEditing&&event.detail ===2) {
            this.handleEdit();
            this.props.setEditStatusCallback(true);
        }
    }
    handleEdit = () => {
        this.setState({editActive: !this.state.editActive});
    }
    handleKeyPress = (event) => {
        if (event.code ==="Enter") {
            this.handleBlur(event);
        }
    }
    handleBlur = (event) => {
        let index = this.props.index;
        let text = event.target.value;
        console.log(text === this.props.text);
        if (this.props.text !== text) {
            this.props.renameItemCallback(index, text);
        }
        this.handleEdit();
        this.props.setEditStatusCallback(false);
        this.setState( {text: text} );
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("text", this.state.index);
        console.log("dragstart: " + this.state.index);
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState({isOver: true});
        console.log("dragover: " + this.state.index);
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState({isOver: false});
        console.log("dragleave: " + this.state.index);
    }
    handleDrop = (event) => {
        event.preventDefault();
        let oldIndex = event.dataTransfer.getData("text");
        let newIndex = this.state.index.toString();
        if (oldIndex !== newIndex) {
            console.log("ondrop: old: " + oldIndex + " new: " + newIndex);
            console.log(typeof newIndex +  " + " + typeof oldIndex);
            this.props.moveItemCallback(oldIndex, newIndex);
        }
        this.setState({isOver: false});
    }
    setClassName = () => {
        if (this.state.isOver) {
            return("top5-item");
        }
        else {
            return("top5-item-dragged-to");
        }
    }
    render() {
        const {index, text, keyValue, isEditing} = this.props;
        if (keyValue === -1) {
            return (
                <div className="top5-item" id={"item-"+index}></div>
            )
        }
        if (this.state.editActive) {
            return (
                <input
                id={"item-"+index}
                className="top5-item"
                type="text"
                onKeyPress={this.handleKeyPress}
                onBlur={this.handleBlur}
                defaultValue={text}
            />)
        }
        else {
            return (
                <div
                    className={this.state.isOver?"top5-item-dragged-to":"top5-item"}
                    id={"item-"+index}
                    onClick={this.handleClick}
                    draggable={isEditing?false:true}
                    onDragStart={this.handleDragStart}
                    onDragOver={this.handleDragOver}
                    onDragLeave={this.handleDragLeave}
                    onDrop={this.handleDrop}
                    >{text}
                </div>
            )
        }
    }
}
