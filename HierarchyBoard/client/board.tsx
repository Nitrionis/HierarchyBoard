import React from 'react';
import CanvasComponent from './canvasComponent';
import ContextMenu from './contextMenu';
import { serverAddress } from './sharedInclude';

interface IProps {  }
interface IState {
    contextMenuVisible: boolean,
    contextMenuTop: string,
    contextMenuLeft: string,
    gridVisible: boolean
}

export default class Board extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            contextMenuVisible: false,
            contextMenuTop: '0px',
            contextMenuLeft: '0px',
            gridVisible: true
        };
        document.body.oncontextmenu = (e) => false;
    }
    contextMenuCalled = (event: MouseEvent) => {
        console.log('contextMenuCalled');
        this.setState({
            contextMenuVisible: true,
            contextMenuTop: event.clientY + 'px',
            contextMenuLeft: event.clientX + 'px'
        });
    }
    render() {
        return (
            <div className='boardMainDiv'>
                <CanvasComponent
                    contextMenuCalled={this.contextMenuCalled}
                    grigVisible={this.state.gridVisible}
                />
                <ContextMenu
                    top={this.state.contextMenuTop}
                    left={this.state.contextMenuLeft}
                    open={this.state.contextMenuVisible}
                    close={() => { this.setState({ contextMenuVisible: false }); }}
                />
            </div>
        );
    }
}