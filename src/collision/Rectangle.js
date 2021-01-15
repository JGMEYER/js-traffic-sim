import PropTypes from 'prop-types';

import React from 'react';

export class Rectangle {
    constructor(centerX, centerY, w, h, angleRad, xOffset, yOffset) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.w = w;
        this.h = h;
        this.angleRad = angleRad;
        this.xOffset = xOffset;
        this.yOffset = yOffset;

        this.defaultVertices = [
            { x: this.centerX - this.w / 2 + xOffset, y: this.centerY - this.h / 2 + yOffset },
            { x: this.centerX + this.w / 2 + xOffset, y: this.centerY - this.h / 2 + yOffset },
            { x: this.centerX + this.w / 2 + xOffset, y: this.centerY + this.h / 2 + yOffset },
            { x: this.centerX - this.w / 2 + xOffset, y: this.centerY + this.h / 2 + yOffset },
        ]

        this.vertices = [
            { x: this.centerX - this.w / 2 + xOffset, y: this.centerY - this.h / 2 + yOffset },
            { x: this.centerX + this.w / 2 + xOffset, y: this.centerY - this.h / 2 + yOffset },
            { x: this.centerX + this.w / 2 + xOffset, y: this.centerY + this.h / 2 + yOffset },
            { x: this.centerX - this.w / 2 + xOffset, y: this.centerY + this.h / 2 + yOffset },
        ]

        this.rotateToAngleRad(this.angleRad);
    }

    get minX() {
        return Math.min(...this.vertices.map(v => v.x));
    }

    get maxX() {
        return Math.max(...this.vertices.map(v => v.x));
    }

    get minY() {
        return Math.min(...this.vertices.map(v => v.y));
    }

    get maxY() {
        return Math.max(...this.vertices.map(v => v.y));
    }

    get boundingWidth() {
        return this.maxX - this.minX;
    }

    get boundingHeight() {
        return this.maxY - this.minY;
    }

    get topLeft() {
        return { top: this.minY, left: this.minX };
    }

    get verticesAtOrigin() {
        return this.vertices.map(e => [e.x - this.minX, e.y - this.minY]);
    }

    get center() {
        return { x: this.centerX, y: this.centerY };
    }

    _rotatePointAroundCenter(p, c, angleRad) {
        const x1 = p.x - c.x;
        const y1 = p.y - c.y;

        const x2 = x1 * Math.cos(angleRad) - y1 * Math.sin(angleRad);
        const y2 = x1 * Math.sin(angleRad) + y1 * Math.cos(angleRad);

        return { x: x2 + c.x, y: y2 + c.y };
    }

    translate(x0, y0) {
        this.centerX += x0;
        this.centerY += y0;
        this.vertices = this.vertices.map(v => { return { x: v.x + x0, y: v.y + y0 } });
        this.defaultVertices = this.defaultVertices.map(v => { return { x: v.x + x0, y: v.y + y0 } });
    }

    rotateToAngleRad(angleRad) {
        const center = this.center;
        this.vertices = [
            this._rotatePointAroundCenter(this.defaultVertices[0], center, angleRad),
            this._rotatePointAroundCenter(this.defaultVertices[1], center, angleRad),
            this._rotatePointAroundCenter(this.defaultVertices[2], center, angleRad),
            this._rotatePointAroundCenter(this.defaultVertices[3], center, angleRad),
        ];
        this.angleRad = angleRad;
    }

    rotateDeg(angleDeg) {
        this.angleRad = (this.angleRad + angleDeg * (Math.PI / 180)) % (2 * Math.PI);
        this.rotateToAngleRad(this.angleRad);
    }
}

export class RectangleCollider extends Rectangle {
    constructor(centerX, centerY, w, h, angleRad, xOffset, yOffset) {
        super(centerX, centerY, w, h, angleRad, xOffset, yOffset);
    }

    _hasSeparatingAxis(a, b) {
        // test each side of a in turn:
        const sides = 4;
        for (let i = 0; i < sides; i++) {
            let normal_x = a.vertices[(i + 1) % sides].y - a.vertices[i].y;
            let normal_y = a.vertices[i].x - a.vertices[(i + 1) % sides].x;
            for (let j = 0; j < sides; j++) {
                let dot_product = ((b.vertices[j].x - a.vertices[i].x) * normal_x) +
                    ((b.vertices[j].y - a.vertices[i].y) * normal_y);
                if (dot_product <= 0.0)
                    break;
                if (j === sides - 1)
                    return true; // all dots were +ve, we found a separating axis
            }
        }
        return false;
    }

    collidesWith(rect) {
        return !this._hasSeparatingAxis(this, rect) && !this._hasSeparatingAxis(rect, this);
    }
}

export class RectangleComponent extends React.Component {
    get polygonStr() {
        const rect = this.props.rect;
        // Create str of vertices, e.g. '1px 2px, 3px 4px, ...'
        const verticesStr = rect.verticesAtOrigin.map(e => e.map(f => f + 'px').join(' ')).join(', ');
        return `polygon(${verticesStr})`;
    }

    render() {
        const rect = this.props.rect;
        return (
            <div style={{
                position: 'absolute',
                backgroundColor: this.props.backgroundColor,
                width: rect.boundingWidth + 'px',
                height: rect.boundingHeight + 'px',
                top: rect.topLeft.top,
                left: rect.topLeft.left,
                clipPath: this.polygonStr,
            }}>
            </div >
        );
    }
}

RectangleComponent.propTypes = {
    rect: PropTypes.object.isRequired,
    backgroundColor: PropTypes.string.isRequired,
}