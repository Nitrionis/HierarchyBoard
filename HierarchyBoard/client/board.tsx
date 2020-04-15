import React from 'react';
import { serverAddress } from './sharedInclude';

interface BoardProps {  }
interface BoardState {  }

export default class Board extends React.Component<BoardProps, BoardState> {
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
            </div>
        );
    }
}

interface CanvasProps {
    contextMenuCalled: (me: MouseEvent) => void;
}
interface CanvasState {
    scaleFactor: number,
    size: {
        width: number,
        height: number
    },
    scale: {
        x: number,
        y: number
    },
    shiftVector: {
        x: number,
        y: number
    },
    dragPrevPos: {
        x: number,
        y: number
    }
}

class CanvasComponent extends React.Component<CanvasProps, CanvasState> {
    canvas: React.RefObject<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.ctx = null;
        this.state = {
            scaleFactor: 1.0,
            size: {
                width: 800,
                height: 600
            },
            scale: {
                x: 1.0,
                y: 1.0
            },
            shiftVector: {
                x: 0.0,
                y: 0.0
            },
            dragPrevPos: null
        };
        window.addEventListener("resize", this.windowResized);
    }
    componentDidMount() {
        this.canvas.current.addEventListener('contextmenu', this.props.contextMenuCalled);
        this.canvas.current.addEventListener('mousedown', this.mousedown);
        this.canvas.current.addEventListener('mouseup', this.mouseup);
        this.canvas.current.addEventListener('mousemove', this.mousemove);
        this.canvas.current.addEventListener('wheel', this.wheel);
        this.ctx = this.canvas.current.getContext('2d');
        this.windowResized();
    }
    mousedown = (event: MouseEvent) => {
        this.setState({
            dragPrevPos: {
                x: event.clientX,
                y: event.clientY
            }
        });
    }
    mouseup = (event: MouseEvent) => {
        this.setState({ dragPrevPos: null });
    }
    mousemove = (event: MouseEvent) => {
        if (this.state.dragPrevPos != null) {
            this.setState((state) => {
                let newShift = null;
                if (state.dragPrevPos != null) {
                    newShift = {
                        x: state.shiftVector.x + (event.clientX - state.dragPrevPos.x) * state.scale.x,
                        y: state.shiftVector.y + (event.clientY - state.dragPrevPos.y) * state.scale.y
                    };
                }
                return {
                    shiftVector: newShift,
                    dragPrevPos: {
                        x: event.clientX,
                        y: event.clientY
                    }
                };
            });
        }
    }
    wheel = (event: WheelEvent) => {
        this.setState((state) => {
            const delta = Math.sign(event.deltaY) / 10.0;
            return {
                scale: {
                    x: Math.min(10, Math.max(0.1, state.scale.x + delta)),
                    y: Math.min(10, Math.max(0.1, state.scale.y + delta))
                }
            }
        });
    }
    windowResized = () => {
        this.setState({
            size: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    updateCanvas = () => {
        this.ctx.resetTransform();
        this.ctx.fillStyle = '#f2f2f2';
        this.ctx.fillRect(0, 0, this.state.size.width, this.state.size.height);
        this.drawGrid();
        this.ctx.translate(
            window.innerWidth / 2 + this.state.shiftVector.x,
            window.innerHeight / 2 + this.state.shiftVector.y);
        this.drawItems();
    }
    drawGrid = () => {
        const gridStep = 128.0;
        this.ctx.strokeStyle = '#e5e5e5';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        let shift = this.state.shiftVector;
        let start = {
            x: shift.x % (gridStep * this.state.scale.x),
            y: shift.y % (gridStep * this.state.scale.y)
        }
        for (let x = start.x; x < this.state.size.width; x += gridStep * this.state.scale.x) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.state.size.height);
        }
        for (let y = start.y; y < this.state.size.height; y += gridStep * this.state.scale.y) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.state.size.width, y);
        }
        this.ctx.stroke();
    }
    drawItems = () => {

    }
    render() {
        return <canvas
            ref={this.canvas}
            width={this.state.size.width}
            height={this.state.size.height}
        />;
    }
}