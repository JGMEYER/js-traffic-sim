import React from 'react';

import '../common/common.css';
import { Direction } from '../common/common';

export const TravelNodeType = {
    ENTER: 0,
    EXIT: 1,
};
Object.freeze(TravelNodeType);

export class TravelNode {
    constructor(row, col, direction, travelNodeType) {
        this.row = row;
        this.col = col;
        this.direction = direction;
        this.travelNodeType = travelNodeType;

        // Calculate (x, y)

        const style = getComputedStyle(document.documentElement);
        const gridWidth = style.getPropertyValue('--grid-width');
        const gridHeight = style.getPropertyValue('--grid-height');

        const topX = col * gridWidth;
        const topY = row * gridHeight;

        const middleX = topX + .50 * gridWidth;
        const middleY = topY + .50 * gridHeight;

        // Shift node based on direction
        const xDirModifier = Direction.LEFT ? -1 : (Direction.RIGHT ? 1 : 0);
        const yDirModifier = Direction.UP ? -1 : (Direction.DOWN ? 1 : 0);

        // Shift node based on type
        // TODO...

        this.x = middleX + .25 * gridWidth * xDirModifier;
        this.y = middleY + .25 * gridHeight * yDirModifier;
    }
}

export class TravelEdge extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div></div>
        );
    }
}

export class TravelGraph extends React.Component {
    render() {
        const exitNode = new TravelNode(1, 1, Direction.DOWN, TravelNodeType.EXIT);
        const enterNode = new TravelNode(2, 1, Direction.UP, TravelNodeType.ENTER);
        return <TravelEdge exitNode={exitNode} enterNode={enterNode} />
    }
}