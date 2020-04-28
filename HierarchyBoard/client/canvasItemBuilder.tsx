import {
    Vector2,
    Rectangle,
    Text,
    ThemedRectangle
} from './canvasItem';

export interface MouseController {
    mousedown: (event: MouseEvent, canvasPoint: Vector2) => boolean;
    mouseup: (event: MouseEvent, canvasPoint: Vector2) => boolean;
    mousemove: (event: MouseEvent, canvasPoint: Vector2) => boolean;
}

export enum Side {
    None  = 0,
    Left  = 1,
    Right = 2,
    Up    = 4,
    Down  = 8
}

export class RectangleBuilder implements MouseController {
    rect: Rectangle;
    ctx: CanvasRenderingContext2D;
    dragSide: Side;
    startPosition: Vector2;
    startSize: Vector2;
    isBuildingStarted: boolean;
    isBuildingFinished: boolean;
    clickCount: number;
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.isBuildingStarted = false;
        this.isBuildingFinished = false;
        this.clickCount = 0;
    }
    building(rect: Rectangle, dragDirection: Side) {
        this.rect = rect;
        this.startPosition = this.rect.position.clone();
        this.startSize = this.rect.size.clone();
        this.dragSide = dragDirection;
        this.isBuildingStarted = true;
    }
    mousedown(event: MouseEvent, canvasPoint: Vector2) {
        this.clickCount++;
        if (this.clickCount >= 2) {
            this.isBuildingFinished = true;
        }
        return false;
    }
    mouseup(event: MouseEvent, canvasPoint: Vector2) {
        return this.dragSide != Side.None;
    }
    mousemove(event: MouseEvent, canvasPoint: Vector2) {
        let isShouldRedraw = this.dragSide != Side.None && !this.isBuildingFinished;
        if (isShouldRedraw) {
            if ((this.dragSide & Side.Left) == Side.Left) {
                if (canvasPoint.x < this.startPosition.x + this.startSize.x) {
                    this.rect.position.x = canvasPoint.x;
                    this.rect.size.x = (this.startPosition.x + this.startSize.x) - canvasPoint.x;
                } else {
                    this.rect.position.x = this.startPosition.x + this.startSize.x;
                    this.rect.size.x = canvasPoint.x - this.rect.position.x;
                    this.dragSide &= ~Side.Left;
                    this.dragSide |= Side.Right;
                }
            }
            if ((this.dragSide & Side.Right) == Side.Right) {
                if (canvasPoint.x < this.startPosition.x + this.startSize.x) {
                    this.rect.position.x = canvasPoint.x;
                    this.rect.size.x = (this.startPosition.x + this.startSize.x) - canvasPoint.x;
                    this.dragSide |= Side.Left;
                    this.dragSide &= ~Side.Right;
                } else {
                    this.rect.position.x = this.startPosition.x + this.startSize.x;
                    this.rect.size.x = canvasPoint.x - this.rect.position.x;
                }
            }
            if ((this.dragSide & Side.Up) == Side.Up) {
                if (canvasPoint.y < this.startPosition.y + this.startSize.y) {
                    this.rect.position.y = canvasPoint.y;
                    this.rect.size.y = (this.startPosition.y + this.startSize.y) - canvasPoint.y;
                } else {
                    this.rect.position.y = this.startPosition.y + this.startSize.y;
                    this.rect.size.y = canvasPoint.y - this.rect.position.y;
                    this.dragSide &= ~Side.Up;
                    this.dragSide |= Side.Down;
                }
            }
            if ((this.dragSide & Side.Down) == Side.Down) {
                if (canvasPoint.y < this.startPosition.y + this.startSize.y) {
                    this.rect.position.y = canvasPoint.y;
                    this.rect.size.y = (this.startPosition.y + this.startSize.y) - canvasPoint.y;
                    this.dragSide |= Side.Up;
                    this.dragSide &= ~Side.Down;
                } else {
                    this.rect.position.y = this.startPosition.y + this.startSize.y;
                    this.rect.size.y = canvasPoint.y - this.rect.position.y;
                }
            }
        }
        return isShouldRedraw;
    }
    draw(scale: number) {
        this.ctx.strokeStyle = '#217af3';
        this.ctx.lineWidth = window.devicePixelRatio / scale;
        this.ctx.strokeRect(
            this.rect.position.x,
            this.rect.position.y,
            this.rect.size.x,
            this.rect.size.y
        );
        this.ctx.strokeStyle = '#acacac';
        this.ctx.fillStyle = '#ffffff';
        let v0 = this.rect.position;
        let v1 = v0.add(this.rect.size);
        this.ctx.beginPath();
        this.ctx.arc(v0.x, v0.y, 4 / scale, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(v0.x, v1.y, 4 / scale, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(v1.x, v1.y, 4 / scale, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(v1.x, v0.y, 4 / scale, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
    }
}

export class TextBuilder {

}