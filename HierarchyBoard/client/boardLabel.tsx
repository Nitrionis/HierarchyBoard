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
import { importFromExcel, exportToExcel } from './excelProcessor';

const ThemedMenu = styled(Menu)({ padding: 0 });
const ThemedMenuItem = styled(MenuItem)({});
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
    isCollapsed: boolean,
    isCreateSubMenuOpen: boolean
}

export default class BoardLabel extends React.Component<IProps, IState> {
    addItemButton: React.RefObject<HTMLButtonElement>;
    constructor(props) {
        super(props);
        this.state = {
            isCollapsed: false,
            isCreateSubMenuOpen: false
        };
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
    render() {
        return (
            <div className='boardControlDiv'>
                <MainButton color="primary" onClick={this.menuClick}>MENU</MainButton>
                <div className='boardMenuButtons'>
                    <Collapse in={!this.state.isCollapsed} timeout="auto" unmountOnExit>
                        <IconButton aria-label="create new" component="span">
                            <ViewCarouselIcon />
                        </IconButton>
                        <IconButton aria-label="create new" component="span">
                            <NoteAddIcon />
                        </IconButton>
                        <IconButton aria-label="delete this" component="span">
                            <DeleteIcon />
                        </IconButton>
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
                    </Collapse>
                </div>
            </div >
        );
    }
}