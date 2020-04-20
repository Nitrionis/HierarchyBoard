import React from 'react';
import ReactDOM from 'react-dom';
import Authorization from './authorization';
import Board from './board';
import { importFromExcel, exportToExcel } from './excelProcessor';

const modeAuthentication = 0;
const modeBoard = 1;

interface IProps {  }
interface IState {
    userName: string,
    mode: number
}

export class App extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            mode: modeAuthentication
        };
        let obj = {
            f1: {
                f12: {

                }
            },
            f2: {

            }
        }
        console.log(exportToExcel('path', { 'test': 123 }));
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