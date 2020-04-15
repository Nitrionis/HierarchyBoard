import React from 'react';
import ReactDOM from 'react-dom';
import Authorization from './authorization';

const modeAuthentication = 0;
const modeLobbyMenu = 1;
const modeGame = 2;

interface Props {  }
interface State {
    userName: string,
    opponentName: string,
    mode: number
}

export class App extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            userName: 'AirAce',
            opponentName: 'AirAceOpponent',
            mode: modeAuthentication
        };
    }
    closeAuthorization = (name: string) => {
        this.setState({
            mode: modeLobbyMenu,
            userName: name
        });
    }
    render() {
        if (this.state.mode == modeLobbyMenu)
            return <h1></h1>;
        if (this.state.mode == modeAuthentication)
            return <Authorization close={this.closeAuthorization} />
        if (this.state.mode == modeGame)
            return <h1></h1>;
    }
}

ReactDOM.render(<App />, document.getElementById('root'));