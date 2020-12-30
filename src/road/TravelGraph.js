import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-lineto';

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

        // Pull variables from .css
        const style = getComputedStyle(document.documentElement);
        const tileWidth = style.getPropertyValue('--tile-width-raw');
        const tileHeight = style.getPropertyValue('--tile-height-raw');

        // Find middle location of tile
        const topX = col * tileWidth;
        const topY = row * tileHeight;
        const middleX = topX + .50 * tileWidth;
        const middleY = topY + .50 * tileHeight;

        // Set node (x, y) to middle of tile
        this.x = middleX;
        this.y = middleY;

        // Shift node (x, y) based on properties
        if (this.direction === Direction.UP) {
            this.y -= tileHeight / 4;
            if (this.travelNodeType === TravelNodeType.ENTER) {
                this.x -= tileWidth / 8;
            } else if (this.travelNodeType === TravelNodeType.EXIT) {
                this.x += tileWidth / 8;
            }
        } else if (this.direction === Direction.RIGHT) {
            this.x += tileWidth / 4;
            if (this.travelNodeType === TravelNodeType.ENTER) {
                this.y -= tileHeight / 8;
            } else if (this.travelNodeType === TravelNodeType.EXIT) {
                this.y += tileHeight / 8;
            }
        } else if (this.direction === Direction.DOWN) {
            this.y += tileHeight / 4;
            if (this.travelNodeType === TravelNodeType.ENTER) {
                this.x += tileWidth / 8;
            } else if (this.travelNodeType === TravelNodeType.EXIT) {
                this.x -= tileWidth / 8;
            }
        } else if (this.direction === Direction.LEFT) {
            this.x -= tileWidth / 4;
            if (this.travelNodeType === TravelNodeType.ENTER) {
                this.y += tileHeight / 8;
            } else if (this.travelNodeType === TravelNodeType.EXIT) {
                this.y -= tileHeight / 8;
            }
        }
    }
}

export class TravelEdge extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Line
                x0={this.props.exitNode.x}
                y0={this.props.exitNode.y}
                x1={this.props.enterNode.x}
                y1={this.props.enterNode.y} />
        );
    }
}

TravelEdge.propTypes = {
    exitNode: PropTypes.object.isRequired,
    enterNode: PropTypes.object.isRequired,
}

export class TravelGraph extends React.Component {
    render() {
        // Example only
        return (
            <div>
                <TravelEdge
                    exitNode={new TravelNode(1, 1, Direction.DOWN, TravelNodeType.EXIT)}
                    enterNode={new TravelNode(2, 1, Direction.UP, TravelNodeType.ENTER)} />
                <TravelEdge
                    exitNode={new TravelNode(2, 1, Direction.RIGHT, TravelNodeType.EXIT)}
                    enterNode={new TravelNode(2, 1, Direction.UP, TravelNodeType.ENTER)} />
                <TravelEdge
                    exitNode={new TravelNode(2, 1, Direction.RIGHT, TravelNodeType.EXIT)}
                    enterNode={new TravelNode(2, 2, Direction.LEFT, TravelNodeType.ENTER)} />
            </div>
        );
    }
}