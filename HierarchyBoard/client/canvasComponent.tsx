import React from 'react';

export interface IDrawable {
    draw : (ctx: CanvasRenderingContext2D) => void;
}

interface IProps {
    contextMenuCalled: (me: MouseEvent) => void;
}
interface IState {
    size: {
        width: number,
        height: number
    },
    scale: number,
    scaleOffset: number,
    shiftVector: {
        x: number,
        y: number
    },
    dragPrevPos: {
        x: number,
        y: number
    }
}

export default class CanvasComponent extends React.Component<IProps, IState> {
    canvas: React.RefObject<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;
    lastCursorPosition: {
        x: number,
        y: number
    }
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.ctx = null;
        this.state = {
            size: {
                width: 800,
                height: 600
            },
            scale: 1.0,
            scaleOffset: 1.0,
            shiftVector: {
                x: 0.0,
                y: 0.0
            },
            dragPrevPos: null
        };
        this.lastCursorPosition = {
            x: window.innerWidth * window.devicePixelRatio / 2,
            y: window.innerHeight * window.devicePixelRatio / 2
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
        this.lastCursorPosition = {
            x: window.innerWidth * window.devicePixelRatio / 2,
            y: window.innerHeight * window.devicePixelRatio / 2
        };
        if (this.state.dragPrevPos != null) {
            this.setState((state) => {
                let newShift = null;
                if (state.dragPrevPos != null) {
                    newShift = {
                        x: state.shiftVector.x + (event.clientX - state.dragPrevPos.x) * window.devicePixelRatio,
                        y: state.shiftVector.y + (event.clientY - state.dragPrevPos.y) * window.devicePixelRatio
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
        if (event.ctrlKey == false) {
            this.setState((state) => {
                const delta = Math.sign(event.deltaY) / 10.0;
                const scaleOffset = Math.min(8, Math.max(0.125, state.scaleOffset + delta));
                const scale = window.devicePixelRatio * scaleOffset;
                const cursorVector = {
                    x: event.clientX * window.devicePixelRatio - this.state.size.width / 2,
                    y: event.clientY * window.devicePixelRatio - this.state.size.height / 2
                };
                const shiftVector = {
                    x: state.shiftVector.x + (state.shiftVector.x - cursorVector.x) * (scale - state.scale) / state.scale,
                    y: state.shiftVector.y + (state.shiftVector.y - cursorVector.y) * (scale - state.scale) / state.scale
                };
                return {
                    scaleOffset: scaleOffset,
                    scale: scale,
                    shiftVector: shiftVector
                }
            });
        }
    }
    windowResized = () => {
        this.setState((state) => {
            const scale = window.devicePixelRatio * state.scaleOffset;
            const cursorVector = {
                x: this.lastCursorPosition.x - this.state.size.width / 2,
                y: this.lastCursorPosition.y - this.state.size.height / 2
            };
            const shiftVector = {
                x: state.shiftVector.x + (state.shiftVector.x - cursorVector.x) * (scale - state.scale) / state.scale,
                y: state.shiftVector.y + (state.shiftVector.y - cursorVector.y) * (scale - state.scale) / state.scale
            };
            return {
                scale: window.devicePixelRatio * state.scaleOffset,
                size: {
                    width: window.innerWidth * window.devicePixelRatio,
                    height: window.innerHeight * window.devicePixelRatio
                },
                shiftVector: shiftVector
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
            this.state.size.width / 2 + this.state.shiftVector.x,
            this.state.size.height / 2 + this.state.shiftVector.y);
        this.ctx.scale(this.state.scale, this.state.scale);
        this.drawItems();
    }
    drawGrid = () => {
        let log2 = Math.log2(this.state.scale);
        let step = Math.pow(2, Math.trunc(log2));
        let bigStep = 300.0 * (1 + (this.state.scale - step) / step);
        let smallStep = bigStep / 5.0;
        this.ctx.strokeStyle = '#e5e5e5';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        let bigStart = {
            x: (this.state.size.width / 2 + this.state.shiftVector.x) % bigStep,
            y: (this.state.size.height / 2 + this.state.shiftVector.y) % bigStep
        };
        for (let x = bigStart.x; x < this.state.size.width; x += bigStep) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.state.size.height);
        }
        for (let y = bigStart.y; y < this.state.size.height; y += bigStep) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.state.size.width, y);
        }
        this.ctx.stroke();
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        let smallStart = {
            x: (this.state.size.width / 2 + this.state.shiftVector.x) % smallStep,
            y: (this.state.size.height / 2 + this.state.shiftVector.y) % smallStep
        };
        for (let x = smallStart.x; x < this.state.size.width; x += smallStep) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.state.size.height);
        }
        for (let y = smallStart.y; y < this.state.size.height; y += smallStep) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.state.size.width, y);
        }
        this.ctx.stroke();
    }
    drawItems = () => {
        let size = this.state.size;
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(-size.width / 4, -size.height / 4, 100, 100);
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(-size.width / 4, +size.height / 4, 100, 100);
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(+size.width / 4, 0, 100, 100);
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(+size.width, 0, 200, 200);
        this.ctx.beginPath();
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.arc(0, 0, 32, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.fillStyle = "rgb(255, 0, 0)";
        this.ctx.arc(
            (-this.state.shiftVector.x - this.state.size.width / 2) / this.state.scale,
            (-this.state.shiftVector.y - this.state.size.height / 2) / this.state.scale,
            32, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgb(0, 0, 0)';
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, this.state.size.height / 2);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -this.state.size.height / 2);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.state.size.width / 2, 0);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-this.state.size.width / 2, 0);
        this.ctx.stroke();
    }
    render() {
        return <canvas
            id='boardCanvas'
            ref={this.canvas}
            width={this.state.size.width}
            height={this.state.size.height}
        />;
    }
}