import React from 'react';
import ReactDOM from 'react-dom';
import Authorization from './authorization';
import Board from './board';

const modeAuthentication = 0;
const modeBoard = 1;

interface Props {  }
interface State {
    userName: string,
    mode: number
}

export class App extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            mode: modeAuthentication
        };
    }
    closeAuthorization = (name: string) => {
        this.setState({
            mode: modeBoard,
            userName: name
        });
    }
    render() {
        if (this.state.mode == modeAuthentication)
            return <Authorization close={this.closeAuthorization} />
        if (this.state.mode == modeBoard)
            return <Board/>;
    }
}

ReactDOM.render(<App />, document.getElementById('root'));