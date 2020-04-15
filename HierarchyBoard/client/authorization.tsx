import React from 'react';
import { serverAddress } from './sharedInclude';
import { styled } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Axios from 'axios';

const MainButton = styled(Button)({
    backgroundColor: '#fe6b8b',
    color: 'white',
    margin: '16px 0px 4px',
    fontSize: '1.1em',
    fontWeight: 600
});

const MainTextButton = styled(Button)({
    margin: '8px 0px',
    color: '#fe6b8b',
    fontSize: '1.1em',
    fontWeight: 600
});

interface Props { close: (name: string) => void }
interface State { mode: boolean }

export default class Authorization extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            mode: true
        }
    }
    toggleMode = () => {
        this.setState({ mode: !this.state.mode });
    }
    getContent = () => {
        if (this.state.mode == true)
            return <LoginMenu toggleMode={this.toggleMode} close={this.props.close} />;
        else
            return <RegistrationMenu toggleMode={this.toggleMode} close={this.props.close} />;
    }
    componentDidMount = () => {
        window.dispatchEvent(new Event('click'));
    }
    render() {
        return (
            <div className='authorizationMainDiv'>
                <div className='authorizationSecondaryDiv'>
                    {this.getContent()}
                </div>
            </div>
        );
    }
}

const MyTypography = styled(Typography)({
    textAlign: 'center',
    color: '#ff5b77'
});

interface LoginProps {
    close: (name: string) => void,
    toggleMode: () => void
}
interface LoginState {
    msg: string,
    mail: string,
    password: string
}

class LoginMenu extends React.Component<LoginProps, LoginState> {
    constructor(props) {
        super(props);
        this.state = {
            msg: '',
            mail: '',
            password: ''
        };
    }
    changeMail = (event) => {
        this.setState({ mail: event.target.value});
    }
    changePssword = (event) => {
        this.setState({ password: event.target.value });
    }
    sigIn = () => {
        Axios.post(serverAddress + 'login/', {
            mail: this.state.mail,
            password: this.state.password
        }).then(this.processServerResponse);
    }
    processServerResponse = (res) => {
        console.log(res);
        console.log(res.data);
        if (res.data.res)
            this.props.close(res.data.name);
        else
            this.setState({ msg: res.data.msg });
    }
    render() {
        return (
            <div className='authorizationSecondaryDiv'>
                <div className='authorizationLabelDiv'>
                    <h6 className='authorizationLabelText'>Login</h6>
                </div>
                <div className='authorizationDiv'>
                    <TextField
                        id="outlined-email-input"
                        label="Email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        margin="normal"
                        variant="outlined"
                        onChange={this.changeMail}
                    />
                    <TextField
                        id="outlined-password-input"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        margin="normal"
                        variant="outlined"
                        onChange={this.changePssword}
                    />
                    <MyTypography variant="h6">{this.state.msg}</MyTypography>
                    <MainButton variant="contained" color="secondary" onClick={this.sigIn}>Next</MainButton>
                    <MainTextButton color="secondary" onClick={this.props.toggleMode}>Registration</MainTextButton>
                </div>
            </div>
        );
    }
}

interface RegistrationProps {
    close: (name: string) => void,
    toggleMode: () => void
}
interface RegistrationState {
    name: string,
    mail: string,
    password: string,
    passwordR: string
    msg: string
}

class RegistrationMenu extends React.Component<RegistrationProps, RegistrationState> {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            mail: '',
            password: '',
            passwordR: '',
            msg: ''
        };
    }
    sigIn = () => {
        Axios.post(serverAddress + 'registration/', {
            name: this.state.name,
            mail: this.state.mail,
            password: this.state.password
        }).then(this.processServerResponse);
    }
    processServerResponse = (res) => {
        console.log(res);
        console.log(res.data);
        if (res.data.res)
            this.props.close(this.state.name);
        else
            this.setState({ msg: res.data.msg });
    }
    changeMail = (event) => {
        this.setState({ mail: event.target.value });
    }
    changePssword = (event) => {
        this.setState({ password: event.target.value });
    }
    changePsswordR = (event) => {
        this.setState({ passwordR: event.target.value });
    }
    changeName = (event) => {
        this.setState({ name: event.target.value });
    }
    render() {
        return (
            <div className='authorizationSecondaryDiv'>
                <div className='authorizationLabelDiv'>
                    <h6 className='authorizationLabelText'>Registration</h6>
                </div>
                <div className='authorizationDiv'>
                    <TextField
                        id="outlined-name"
                        label="Name"
                        value={this.state.name}
                        onChange={this.changeName}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        id="outlined-email-input"
                        label="Email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        margin="normal"
                        variant="outlined"
                        onChange={this.changeMail}
                    />
                    <TextField
                        id="outlined-password-input"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        margin="normal"
                        variant="outlined"
                        onChange={this.changePssword}
                    />
                    <TextField
                        id="outlined-password-input"
                        label="Repeat password"
                        type="password"
                        autoComplete="current-password"
                        margin="normal"
                        variant="outlined"
                        onChange={this.changePsswordR}
                    />
                    <MyTypography variant="h6">{this.state.msg}</MyTypography>
                    <MainButton variant="contained" color="secondary" onClick={this.sigIn}>Next</MainButton>
                    <MainTextButton color="secondary" onClick={this.props.toggleMode}>Login</MainTextButton>
                </div>
            </div>
        );
    }
}