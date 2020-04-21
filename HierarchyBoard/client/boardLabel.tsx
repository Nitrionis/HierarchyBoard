import React from 'react';
import { styled } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ViewCarouselIcon from '@material-ui/icons/ViewCarousel';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Collapse from '@material-ui/core/Collapse';
import { display } from '@material-ui/system';
import { importFromExcel, exportToExcel } from './excelProcessor';

const MainButton = styled(Button)({
    fontSize: '1.2em',
    fontWeight: 600,
    color: '#474949de',
    borderColor: '#fcfcfc',
    padding: '4px 16px',
    '&:hover': {
        color: '#dc004e',
        backgroundColor: '#ffffff'
    },
    '&:active': {
        color: '#dc004e',
        backgroundColor: '#ffffff'
    },
});

interface IProps {}
interface IState {
    isCollapsed: boolean
}

export default class BoardLabel extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            isCollapsed: false
        };
    }
    menuClick = () => {
        this.setState((state) => {
            return {
                isCollapsed: !state.isCollapsed
            };
        });
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