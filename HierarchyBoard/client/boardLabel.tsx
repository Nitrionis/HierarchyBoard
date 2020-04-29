import React from 'react';
import { styled } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import ViewCarouselIcon from '@material-ui/icons/ViewCarousel';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Collapse from '@material-ui/core/Collapse';
import GridOnIcon from '@material-ui/icons/GridOn';
import AddBoxIcon from '@material-ui/icons/AddBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import FormatSizeIcon from '@material-ui/icons/FormatSize';
import DescriptionIcon from '@material-ui/icons/Description';
import SaveIcon from '@material-ui/icons/Save';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { importFromExcel, exportToExcel } from './excelProcessor';
import Axios from 'axios';
import { string } from 'prop-types';

const ThemedMenu = styled(Menu)({ padding: 0 });
const ThemedMenuItem = styled(MenuItem)({});
const ThemedMenuItemIcon = styled(ListItemIcon)({
    minWidth: 0
});
const ThemedListItemText = styled(ListItemText)({ marginLeft: '-24px' });

const MainButton = styled(Button)({
    fontSize: '1.2em',
    fontWeight: 600,
    color: '#474949de',
    borderColor: '#fcfcfc',
    padding: '8px 16px',
    '&:hover': {
        color: '#dc004e',
        backgroundColor: '#ffffff'
    },
    '&:active': {
        color: '#dc004e',
        backgroundColor: '#ffffff'
    },
});

interface IProps {
    toggleGrid: () => void;
    createRect: () => void;
    createText: () => void;
}
interface IState {
    isCollapsed: boolean;
    isUserFilesListOpen: boolean;
    isCreateSubMenuOpen: boolean;
    fileNames: Array<string>;
    alertMessage: string;
    isSnackbarOpen: boolean;
    isSaveDialogOpen: boolean;
}

export default class BoardLabel extends React.Component<IProps, IState> {
    userFilesButton: React.RefObject<HTMLButtonElement>;
    addItemButton: React.RefObject<HTMLButtonElement>;
    constructor(props) {
        super(props);
        this.state = {
            isCollapsed: false,
            isUserFilesListOpen: false,
            isCreateSubMenuOpen: false,
            fileNames: [
                'file_1',
                'file_2',
                'file_3',
                'file_4',
                'file_5',
            ],
            alertMessage: '',
            isSnackbarOpen: false,
            isSaveDialogOpen: false,
        };
        this.userFilesButton = React.createRef();
        this.addItemButton = React.createRef();
    }
    menuClick = () => {
        this.setState((state) => {
            return {
                isCollapsed: !state.isCollapsed
            };
        });
    }
    createRect = () => {
        this.setState({ isCreateSubMenuOpen: false });
        this.props.createRect();
    }
    createText = () => {
        this.setState({ isCreateSubMenuOpen: false });
        this.props.createText();
    }
    getUserFilesList = () => {
        this.setState({ isUserFilesListOpen: true });
    }
    deleteFile = (fileName: string) => {
        this.setState({
            alertMessage: fileName + ' successful deleted!',
            isSnackbarOpen: true
        });
    }
    closeSnackbar = () => {
        this.setState({
            isSnackbarOpen: false
        });
    }
    closeSaveDialog = () => {
        this.setState({
            isSaveDialogOpen: false
        });
    }
    buildFilesList = () => {
        var arr = [];
        for (let name of this.state.fileNames) {
            arr.push((
                <ThemedMenuItem>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                        onClick={() => console.log('file button')}
                    >
                        <ListItemIcon>
                            <DescriptionIcon fontSize="small" />
                        </ListItemIcon>
                        <ThemedListItemText primary={name} />
                        <div style={{ width: '16px' }}></div>
                    </div>
                    <IconButton
                        onClick={() => this.deleteFile(name)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </ThemedMenuItem>
            ));
        }
        return arr;
    }
    render() {
        return (
            <div className='boardControlDiv'>
                <MainButton color="primary" onClick={this.menuClick}>MENU</MainButton>
                <div className='boardMenuButtons'>
                    <Collapse in={!this.state.isCollapsed} timeout="auto" unmountOnExit>
                        <IconButton
                            ref={this.userFilesButton}
                            aria-label="create new"
                            component="span"
                            onClick={this.getUserFilesList}
                        >
                            <ViewCarouselIcon />
                        </IconButton>
                        <ThemedMenu
                            id="customized-menu"
                            anchorEl={this.userFilesButton.current}
                            keepMounted
                            open={this.state.isUserFilesListOpen}
                            onClose={() => this.setState({ isUserFilesListOpen: false })}
                            MenuListProps={{
                                disablePadding: true
                            }}
                        >
                            {this.buildFilesList()}
                        </ThemedMenu>
                        <IconButton
                            aria-label="download excel"
                            component="span"
                            onClick={() => { this.setState({ isSaveDialogOpen: true }); }}
                        >
                            <SaveIcon />
                        </IconButton>
                        <Dialog
                            open={this.state.isSaveDialogOpen}
                            onClose={this.closeSaveDialog}
                            aria-labelledby="form-dialog-title"
                        >
                            <DialogTitle id="form-dialog-title">Enter file name!</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    If the name is selected, the file will not be saved.
                                </DialogContentText>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="name"
                                    fullWidth
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.closeSaveDialog} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={this.closeSaveDialog} color="primary">
                                    Save
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <IconButton
                            aria-label="download excel"
                            component="span"
                            onClick={this.props.toggleGrid}
                        >
                            <GridOnIcon />
                        </IconButton>
                        <IconButton
                            ref={this.addItemButton}
                            aria-label="create item"
                            component="span"
                            onClick={() => this.setState({
                                isCreateSubMenuOpen: true
                            })}
                        >
                            <AddBoxIcon />
                        </IconButton>
                        <ThemedMenu
                            id="customized-menu"
                            anchorEl={this.addItemButton.current}
                            keepMounted
                            open={this.state.isCreateSubMenuOpen}
                            onClose={() => this.setState({ isCreateSubMenuOpen: false })}
                            MenuListProps={{
                                disablePadding: true
                            }}
                        >
                            <ThemedMenuItem button onClick={this.createRect}>
                                <ListItemIcon>
                                    <CheckBoxOutlineBlankIcon fontSize="small" />
                                </ListItemIcon>
                                <ThemedListItemText primary="Rect" />
                            </ThemedMenuItem>
                            <ThemedMenuItem button onClick={this.createText}>
                                <ListItemIcon>
                                    <FormatSizeIcon fontSize="small" />
                                </ListItemIcon>
                                <ThemedListItemText primary="Text" />
                            </ThemedMenuItem>
                        </ThemedMenu>
                        <input
                            type="file"
                            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            style={{ display: 'none' }}
                            id='contained-button-file'
                            onChange={(evt) => importFromExcel(evt.target.files[0])}
                        />
                        <label htmlFor="contained-button-file">
                            <IconButton aria-label="upload excel" component="span">
                                <CloudUploadIcon />
                            </IconButton>
                        </label>
                        <IconButton aria-label="download excel" component="span">
                            <CloudDownloadIcon />
                        </IconButton>
                        <Snackbar open={this.state.isSnackbarOpen} autoHideDuration={6000} onClose={this.closeSnackbar}>
                            <MuiAlert elevation={6} variant="filled" onClose={this.closeSnackbar} severity="success">
                                {this.state.alertMessage}
                            </MuiAlert>
                        </Snackbar>
                    </Collapse>
                </div>
            </div >
        );
    }
}