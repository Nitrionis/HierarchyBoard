import React from 'react';
import BoardLabel from './boardLabel';
import {
    MouseController,
    RectangleBuilder,
    Side
} from './canvasItemBuilder';
import {
    Vector2,
    Rectangle,
    ICanvasItem,
    Text,
    ThemedRectangle
} from './canvasItem';

interface IProps {
    contextMenuCalled: (me: MouseEvent) => void;
    grigVisible: boolean;
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
    },
    rectangleBuilder: RectangleBuilder,
    gridVisible: boolean
}

export default class CanvasComponent
    extends React.Component<IProps, IState>
    implements MouseController
{
    canvas: React.RefObject<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;
    items: Array<ICanvasItem>;
    controllers: Array<MouseController>;
    lastCursorPosition: {
        x: number,
        y: number
    };
    constructor(props) {
        super(props);
        this.items = [];
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
            dragPrevPos: null,
            rectangleBuilder: null,
            gridVisible: true
        };
        this.lastCursorPosition = {
            x: window.innerWidth * window.devicePixelRatio / 2,
            y: window.innerHeight * window.devicePixelRatio / 2
        };
        this.controllers = [];
        this.controllers.push(this);
        window.addEventListener("resize", this.windowResized);
    }
    componentDidMount() {
        this.canvas.current.addEventListener('mousedown', this.mousedownController);
        this.canvas.current.addEventListener('mouseup', this.mouseupController);
        this.canvas.current.addEventListener('mousemove', this.mousemoveController);
        this.canvas.current.addEventListener('wheel', this.wheel);
        this.ctx = this.canvas.current.getContext('2d');
        this.windowResized();
    }
    isCompleted = () => false;
    getCanvasPoint = (event: MouseEvent) => new Vector2(
        (-this.state.shiftVector.x + event.clientX * window.devicePixelRatio - this.state.size.width / 2) / this.state.scale,
        (-this.state.shiftVector.y + event.clientY * window.devicePixelRatio - this.state.size.height / 2) / this.state.scale
    );
    getHitTestTarget = (canvasPoint: Vector2) => {
        for (let item of this.items) {
            let targetItem = item.hitTest(canvasPoint);
            if (targetItem != null) {
                return targetItem;
            }
        }
        return null;
    }
    getActiveController = () => {
        let controller = this.controllers[this.controllers.length - 1];
        if (controller.isCompleted()) {
            console.log('controller completed');
            this.controllers.pop();
        }
        return controller;
    }
    mousedownController = (event: MouseEvent) => {
        let canvasPoint = this.getCanvasPoint(event);
        let hitTestTarget = this.getHitTestTarget(canvasPoint);
        if (this.getActiveController().mousedown(event, canvasPoint, hitTestTarget)) {
            this.redraw();
        }
    }
    mouseupController = (event: MouseEvent) => {
        if (this.getActiveController().mouseup(event, this.getCanvasPoint(event))) {
            this.redraw();
        }
    }
    mousemoveController = (event: MouseEvent) => {
        if (this.getActiveController().mousemove(event, this.getCanvasPoint(event))) {
            this.redraw();
        }
    }
    mousedown = (event: MouseEvent, canvasPoint: Vector2) => {
        document.body.style.cursor = 'default';
        let targetItem = this.getHitTestTarget(canvasPoint);
        console.log(targetItem);
        if (targetItem instanceof ThemedRectangle) {
            this.controllers.push(new RectangleBuilder(
                this.ctx, targetItem, this.controllers, this.items));
        }
        this.setState({
            dragPrevPos: {
                x: event.clientX,
                y: event.clientY
            }
        });
        return true;
    }
    mouseup = (event: MouseEvent, canvasPoint: Vector2) => {
        document.body.style.cursor = 'default';
        this.setState({ dragPrevPos: null });
        return true;
    }
    mousemove = (event: MouseEvent, canvasPoint: Vector2) => {
        document.body.style.cursor = 'default';
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
        return true;
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
        this.redraw();
    }
    redraw = () => {
        this.ctx.resetTransform();
        this.ctx.fillStyle = '#f2f2f2';
        this.ctx.fillRect(0, 0, this.state.size.width, this.state.size.height);
        if (this.state.gridVisible) {
            this.drawGrid();
        }
        this.ctx.translate(
            this.state.size.width / 2 + this.state.shiftVector.x,
            this.state.size.height / 2 + this.state.shiftVector.y);
        this.ctx.scale(this.state.scale, this.state.scale);
        this.drawItems();
        let controller = this.controllers[this.controllers.length - 1];
        if (controller.isCompleted()) {
            console.log('controller completed');
            this.controllers.pop();
        }
        controller.postDraw(this.state.scale);
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
        if (this.items != null) {
            for (let i of this.items) {
                i.draw(this.ctx);
            }
        }
    }
    postDraw = () => { }
    toggleGrid = () => {
        this.setState((state) => {
            return { gridVisible: !state.gridVisible }
        });
    }
    createRect = () => {
        this.setState(() => {
            let rectangle = new ThemedRectangle(
                null, new Vector2(0, 0), null, '#eaac30', '#3087ea', 4, 32);
            let rectangleBuilder = new RectangleBuilder(
                this.ctx, rectangle, this.controllers, this.items);
            this.controllers.push(rectangleBuilder);
            return { rectangleBuilder: rectangleBuilder }
        });
    }
    createText = () => {

    }
    render() {
        return <div>
            <canvas
                id='boardCanvas'
                ref={this.canvas}
                width={this.state.size.width}
                height={this.state.size.height}
            />
            <BoardLabel
                toggleGrid={this.toggleGrid}
                createRect={this.createRect}
                createText={this.createText}
            />
        </div>;
    }
}