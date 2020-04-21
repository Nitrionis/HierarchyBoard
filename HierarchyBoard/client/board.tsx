import React from 'react';
import CanvasComponent from './canvasComponent';
import BoardLabel from './boardLabel';
import { serverAddress } from './sharedInclude';

interface IProps {  }
interface IState {  }

export default class Board extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {};
        document.body.oncontextmenu = (e) => false;
    }
    contextMenuCalled = (e) => {
        console.log('contextMenuCalled');
        console.log(e);
    }
    render() {
        return (
            <div className='boardMainDiv'>
                <CanvasComponent contextMenuCalled={this.contextMenuCalled} />
                <BoardLabel />
            </div>
        );
    }
}