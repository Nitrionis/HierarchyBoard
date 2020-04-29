import {
    Vector2,
    Rectangle,
    Text,
    ThemedRectangle,

    ICanvasItem
} from './canvasItem';
import { number } from 'prop-types';

export interface MouseController {
    isCompleted: () => boolean;
    mousedown: (event: MouseEvent, canvasPoint: Vector2, hitTestTarget: ICanvasItem) => boolean;
    mouseup: (event: MouseEvent, canvasPoint: Vector2) => boolean;
    mousemove: (event: MouseEvent, canvasPoint: Vector2) => boolean;
    postDraw: (scale: number) => void;
}

export enum Side {
    None  = 0,
    Left  = 1,
    Right = 2,
    Up    = 4,
    Down  = 8
}

class BoundingRect {
    static draw(ctx: CanvasRenderingContext2D, rect: Rectangle, scale: number) {
        ctx.strokeStyle = '#217af3';
        ctx.lineWidth = window.devicePixelRatio / scale;
        ctx.strokeRect(
            rect.position.x,
            rect.position.y,
            rect.size.x,
            rect.size.y
        );
        ctx.strokeStyle = '#acacac';
        ctx.fillStyle = '#ffffff';
        let v0 = rect.position;
        let v1 = v0.add(rect.size);
        ctx.beginPath();
        ctx.arc(v0.x, v0.y, 4 / scale, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(v0.x, v1.y, 4 / scale, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(v1.x, v1.y, 4 / scale, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(v1.x, v0.y, 4 / scale, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }
}

export class RectangleMover implements MouseController {
    controllers: Array<MouseController>;
    ctx: CanvasRenderingContext2D;
    rect: Rectangle;
    offset: Vector2;
    completed: boolean;
    constructor(ctx: CanvasRenderingContext2D, controllers: Array<MouseController>, rect: Rectangle) {
        this.ctx = ctx;
        this.rect = rect;
        this.offset = null;
        this.completed = false;
        this.controllers = controllers;
    }
    isCompleted() {
        return this.completed;
    }
    mousedown(event: MouseEvent, canvasPoint: Vector2, hitTestTarget: ICanvasItem) {
        this.offset = canvasPoint.subtract(this.rect.position);
        document.body.style.cursor = 'move';
        return true;
    }
    mouseup(event: MouseEvent, canvasPoint: Vector2) {
        this.offset = null;
        this.completed = true;
        document.body.style.cursor = 'move';
        return true;
    }
    mousemove(event: MouseEvent, canvasPoint: Vector2) {
        if (this.offset != null) {
            this.rect.position = canvasPoint.subtract(this.offset);
        }
        document.body.style.cursor = 'move';
        return this.offset != null;
    }
    postDraw(scale: number) {
        if (this.rect.position != null) {
            BoundingRect.draw(this.ctx, this.rect, scale);
        }
    }
}

export class RectangleBuilder implements MouseController {
    controllers: Array<MouseController>;
    canvasItems: Array<ICanvasItem>;
    ctx: CanvasRenderingContext2D;
    rect: Rectangle;
    dragSide: Side;
    startPosition: Vector2;
    startSize: Vector2;
    completed: boolean;
    constructor(ctx: CanvasRenderingContext2D, rect: Rectangle, controllers: Array<MouseController>, items: Array<ICanvasItem>) {
        this.ctx = ctx;
        this.rect = rect;
        this.canvasItems = items;
        this.controllers = controllers;
        this.dragSide = Side.None;
        this.startPosition = rect.position == null ? null : rect.position.clone();
        this.startSize = rect.size.clone();
        this.completed = false;
    }
    isCompleted() {
        return this.completed;
    }
    mousedown(event: MouseEvent, canvasPoint: Vector2, hitTestTarget: ICanvasItem) {
        if (this.rect.size.x == 0 && this.rect.size.y == 0) {
            this.dragSide = Side.Right | Side.Down;
            this.rect.position = canvasPoint.clone();
            this.startPosition = canvasPoint.clone();
            this.canvasItems.push(this.rect);
        } else {
            if (this.dragSide != Side.None) {
                this.dragSide = Side.None;
                this.startSize = this.rect.size.clone();
                this.startPosition = this.rect.position.clone();
            } else {
                let cursor = this.getCursorStyle(canvasPoint);
                document.body.style.cursor = cursor.style;
                this.completed = cursor.side == Side.None;
                console.log(cursor.side);
                let moveFlags = Side.Down | Side.Up | Side.Left | Side.Right;
                if ((cursor.side & moveFlags) == moveFlags) {
                    let controller = new RectangleMover(this.ctx, this.controllers, this.rect);
                    controller.mousedown(event, canvasPoint, this.rect);
                    this.controllers.push(controller);
                } else {
                    this.dragSide = cursor.side;
                }
            }
        }
        return true;
    }
    mouseup(event: MouseEvent, canvasPoint: Vector2) {
        return false;
    }
    mousemove(event: MouseEvent, canvasPoint: Vector2) {
        if (this.rect.position != null) {
            document.body.style.cursor = this.getCursorStyle(canvasPoint).style;
        }
        let isShouldRedraw = this.dragSide != Side.None;
        if (isShouldRedraw) {
            if ((this.dragSide & Side.Left) == Side.Left) {
                if (canvasPoint.x < this.startPosition.x + this.startSize.x) {
                    this.rect.position.x = canvasPoint.x;
                    this.rect.size.x = (this.startPosition.x + this.startSize.x) - canvasPoint.x;
                } else {
                    this.rect.size.x = canvasPoint.x - this.rect.position.x;
                    this.dragSide &= ~Side.Left;
                    this.dragSide |= Side.Right;
                }
            }
            if ((this.dragSide & Side.Right) == Side.Right) {
                if (canvasPoint.x < this.rect.position.x) {
                    this.rect.size.x = this.rect.position.x - canvasPoint.x;
                    this.rect.position.x = canvasPoint.x;
                    this.startPosition.x = this.rect.position.x;
                    this.startSize.x = this.rect.size.x;
                    this.dragSide |= Side.Left;
                    this.dragSide &= ~Side.Right;
                } else {
                    this.rect.size.x = canvasPoint.x - this.rect.position.x;
                }
            }
            if ((this.dragSide & Side.Up) == Side.Up) {
                if (canvasPoint.y < this.startPosition.y + this.startSize.y) {
                    this.rect.position.y = canvasPoint.y;
                    this.rect.size.y = (this.startPosition.y + this.startSize.y) - canvasPoint.y;
                } else {
                    this.rect.size.y = canvasPoint.y - this.rect.position.y;
                    this.dragSide &= ~Side.Up;
                    this.dragSide |= Side.Down;
                }
            }
            if ((this.dragSide & Side.Down) == Side.Down) {
                if (canvasPoint.y < this.rect.position.y) {
                    this.rect.size.y = this.rect.position.y - canvasPoint.y;
                    this.rect.position.y = canvasPoint.y;
                    this.startPosition.y = this.rect.position.y;
                    this.startSize.y = this.rect.size.y;
                    this.dragSide |= Side.Up;
                    this.dragSide &= ~Side.Down;
                } else {
                    this.rect.size.y = canvasPoint.y - this.rect.position.y;
                }
            }
        }
        return isShouldRedraw;
    }
    postDraw(scale: number) {
        if (this.rect.position != null) {
            BoundingRect.draw(this.ctx, this.rect, scale);
        }
    }
    getCursorStyle(canvasPoint: Vector2) {
        let style = 'default';
        let side = Side.None;
        const borderSize = 4;
        let leftDist = Math.abs(canvasPoint.x - this.rect.position.x);
        let rightDist = Math.abs(canvasPoint.x - (this.rect.position.x + this.rect.size.x));
        let bottomDist = Math.abs(canvasPoint.y - this.rect.position.y);
        let topDist = Math.abs(canvasPoint.y - (this.rect.position.y + this.rect.size.y));
        if (bottomDist < topDist) {
            if (bottomDist < borderSize) {
                style = 's-resize';
                side |= Side.Up;
            }
        } else {
            if (topDist < borderSize) {
                style = 'n-resize';
                side |= Side.Down;
            }
        }
        if (leftDist < rightDist) {
            if (leftDist < borderSize) {
                style = 'w-resize';
                if ((side & Side.Down) == Side.Down) {
                    style = 'sw-resize';
                }
                if ((side & Side.Up) == Side.Up) {
                    style = 'nw-resize';
                }
                side |= Side.Left;
            }
        } else {
            if (rightDist < borderSize) {
                style = 'e-resize';
                if ((side & Side.Down) == Side.Down) {
                    style = 'se-resize';
                }
                if ((side & Side.Up) == Side.Up) {
                    style = 'ne-resize';
                }
                side |= Side.Right;
            }
        }
        if (
            side == Side.None &&
            canvasPoint.x > this.rect.position.x &&
            canvasPoint.x < this.rect.position.x + this.rect.size.x &&
            canvasPoint.y > this.rect.position.y &&
            canvasPoint.y < this.rect.position.y + this.rect.size.y
            )
        {
            style = 'move';
            side = Side.Down | Side.Up | Side.Left | Side.Right;
        }
        return {
            style: style,
            side: side
        };
    }
}

export class TextBuilder {

}