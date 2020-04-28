
export class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    add(other: Vector2) {
        return new Vector2(
            this.x + other.x,
            this.y + other.y
        );
    }
    subtract(other: Vector2) {
        return new Vector2(
            this.x - other.x,
            this.y - other.y
        );
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
}

export class BoundingRect {
    v0: Vector2;
    v1: Vector2;
    constructor(v0: Vector2, v1: Vector2) {
        this.v0 = v0;
        this.v1 = v1;
    }
}

export interface ICanvasItem {
    draw: (ctx: CanvasRenderingContext2D) => void;
    hitTest: (point: Vector2) => ICanvasItem;
    getBoundingRect: () => BoundingRect;
}

export class RenderGroup implements ICanvasItem {
    innerComponents: Array<ICanvasItem>;
    constructor(innerComponents: Array<ICanvasItem>) {
        this.innerComponents = innerComponents;
    }
    draw(ctx: CanvasRenderingContext2D) {
        for (let ic of this.innerComponents) {
            ic.draw(ctx);
        }
    }
    hitTest(point: Vector2) {
        let res = null;
        for (let ic of this.innerComponents) {
            res = ic.hitTest(point);
        }
        return res;
    }
    getBoundingRect() {
        let rect = new BoundingRect(
            new Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
            new Vector2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)
        );
        for (let ic of this.innerComponents) {
            let r = ic.getBoundingRect();
            rect.v0.x = Math.min(rect.v0.x, r.v0.x);
            rect.v0.y = Math.min(rect.v0.y, r.v0.y);
            rect.v1.x = Math.max(rect.v1.x, r.v1.x);
            rect.v1.y = Math.max(rect.v1.y, r.v1.y);
        }
        return rect;
    }
}

export class Rectangle implements ICanvasItem {
    position: Vector2;
    size: Vector2;
    innerComponent: Rectangle;
    constructor(position: Vector2, size: Vector2, innerComponent: Rectangle) {
        this.position = position;
        this.size = size;
        this.innerComponent = innerComponent;
    }
    getCenter() {
        return new Vector2(
            this.position.x + this.size.x / 2.0,
            this.position.y + this.size.y / 2.0
        );
    }
    getLeftCenter() {
        return new Vector2(
            this.position.x,
            this.position.y + this.size.y / 2.0
        );
    }
    getRightCenter() {
        return new Vector2(
            this.position.x + this.size.x,
            this.position.y + this.size.y / 2.0
        );
    }
    getTopCenter() {
        return new Vector2(
            this.position.x + this.size.x / 2.0,
            this.position.y
        );
    }
    getBottomCenter() {
        return new Vector2(
            this.position.x + this.size.x / 2.0,
            this.position.y + this.size.y
        );
    }
    moveByVector(vector: Vector2) {
        this.position.x += vector.x;
        this.position.y += vector.y;
        throw new Error('Not implemented method moveByVector!');
    }
    getBoundingRect() {
        let rect = {
            v0: this.position.clone(),
            v1: this.position.add(this.size)
        };
        if (this.innerComponent != null) {
            let r = this.innerComponent.getBoundingRect();
            rect.v0.x = Math.min(rect.v0.x, r.v0.x);
            rect.v0.y = Math.min(rect.v0.y, r.v0.y);
            rect.v1.x = Math.max(rect.v1.x, r.v1.x);
            rect.v1.y = Math.max(rect.v1.y, r.v1.y);
        }
        return rect;
    }
    draw(ctx: CanvasRenderingContext2D) {
        throw new Error('Not implemented method draw!');
    }
    hitTest(point: Vector2) {
        let rect = {
            v0: this.position,
            v1: this.position.add(this.size)
        };
        let selfHitTest =
            (rect.v0.x < point.x && point.x < rect.v1.x &&
                rect.v0.y < point.y && point.y < rect.v1.y) ? this : null;
        let innerHitTest = this.innerComponent == null ? null : this.innerComponent.hitTest(point);
        return innerHitTest != null ? innerHitTest : selfHitTest;
    }
}

export class ThemedRectangle extends Rectangle {
    strokeColor: string;
    fillColor: string;
    lineWidth: number;
    radius: number;
    constructor(
        position: Vector2,
        size: Vector2,
        innerComponent: Rectangle,
        strokeColor: string,
        fillColor: string,
        lineWidth: number,
        radius: number)
    {
        super(position, size, innerComponent);
        this.strokeColor = strokeColor;
        this.fillColor = fillColor;
        this.lineWidth = lineWidth;
        this.radius = radius;
    }
    draw(ctx: CanvasRenderingContext2D) {
        if (this.strokeColor != null) {
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.strokeColor;
            if (this.radius > 1) {
                this.drawRoundRect(
                    ctx,
                    this.position.x,
                    this.position.y,
                    this.size.x,
                    this.size.y,
                    this.radius
                );
            } else {
                ctx.fillRect(
                    this.position.x,
                    this.position.y,
                    this.size.x,
                    this.size.y
                );
            }
            ctx.stroke();
        }
        if (this.fillColor != null) {
            ctx.fillStyle = this.fillColor;
            if (this.radius > 1) {
                this.drawRoundRect(
                    ctx,
                    this.position.x,
                    this.position.y,
                    this.size.x,
                    this.size.y,
                    this.radius
                );
            } else {
                ctx.fillRect(
                    this.position.x,
                    this.position.y,
                    this.size.x,
                    this.size.y
                );
            }
            ctx.fill();
        }
    }
    drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }
}

export class Text extends Rectangle {
    text: string;
    color: string;
    constructor(position: Vector2, size: Vector2, color: string, text: string) {
        super(position, size, null);
        this.color = color;
        this.text = text;
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.font = this.size.y + 'px sans-serif';
        ctx.fillText(this.text, this.position.x, this.position.y + this.size.y, this.size.x);
    }
}