import React from 'react';
import { styled } from '@material-ui/styles';
import Collapse from '@material-ui/core/Collapse';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import FormatSizeIcon from '@material-ui/icons/FormatSize';

const ThemedMenu = styled(Menu)({
    padding: 0
});

const ThemedMenuItem = styled(MenuItem)({
    //padding: 0
});

const ThemedListItemText = styled(ListItemText)({
    marginLeft: '-24px'
});

interface IProps {
    top: string,
    left: string,
    open: boolean,
    close: () => void
}
interface IState {
    isCreateSubMenuOpen: boolean
}

export default class ContextMenu extends React.Component<IProps, IState> {
    menuPosition: React.RefObject<HTMLDivElement>;
    subMenuPosition: React.RefObject<HTMLDivElement>;
    constructor(props) {
        super(props);
        this.state = {
            isCreateSubMenuOpen: false
        };
        this.menuPosition = React.createRef();
        this.subMenuPosition = React.createRef();
    }
    handleCreateSubMenu = () => {
        this.setState((state) => {
            return { isCreateSubMenuOpen: !state.isCreateSubMenuOpen };
        });
    };
    createRect = () => {
        this.setState({ isCreateSubMenuOpen: false });
        this.props.close();
    }
    createText = () => {
        this.setState({ isCreateSubMenuOpen: false });
        this.props.close();
    }
    render() {
        return (
            <div id='boardContextMenu' style={{ top: this.props.top, left: this.props.left }}>
                <div ref={this.menuPosition} style={{ display: 'block' }}>
                    <ThemedMenu
                        id="customized-menu"
                        anchorEl={this.menuPosition.current}
                        keepMounted
                        open={this.props.open}
                        onClose={this.props.close}
                        MenuListProps={{
                            disablePadding: true
                        }}
                    >
                        <div style={{ display: 'inline-block' }}>
                            <ThemedMenuItem button onClick={() => this.setState({ isCreateSubMenuOpen: true })}>
                                <ListItemIcon>
                                    <AddCircleOutlineIcon fontSize="small" />
                                </ListItemIcon>
                                <ThemedListItemText primary="Create" />
                                {this.state.isCreateSubMenuOpen ? <ExpandLess /> : <ExpandMore />}
                            </ThemedMenuItem>
                        </div>
                        <div ref={this.subMenuPosition} style={{ display: 'inline-block' }}></div>
                    </ThemedMenu>
                </div>
                <ThemedMenu
                    id="customized-menu"
                    anchorEl={this.subMenuPosition.current}
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
            </div>
        );
    }
}