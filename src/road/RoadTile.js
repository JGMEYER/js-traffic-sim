import React from 'react';
import PropTypes from 'prop-types';

import { Direction } from '../common/common';
import './RoadTile.css';

export const RoadTileType = {
    // no tile
    EMPTY: 0,
    // no neighbors
    ALONE: 1,
    // one neighbor
    UP: 2,
    RIGHT: 3,
    DOWN: 4,
    LEFT: 5,
    // two neighbors
    UP_RIGHT: 6,  // ╚
    RIGHT_DOWN: 7,  // ╔
    DOWN_LEFT: 8,  // ╗
    UP_LEFT: 9,  // ╝
    UP_DOWN: 10,  // ║
    RIGHT_LEFT: 11,  // ═
    // three neighbors
    UP_RIGHT_DOWN: 12,  // ╠
    RIGHT_DOWN_LEFT: 13,  // ╦
    UP_DOWN_LEFT: 14,  // ╣
    UP_RIGHT_LEFT: 15,  // ╩
    // four neighbors
    UP_RIGHT_DOWN_LEFT: 16,  //  ╬
};
Object.freeze(RoadTileType);

export function getSegmentDirectionsForRoadTileType(roadTileType) {
    switch (roadTileType) {
        case RoadTileType.EMPTY:
            return [];
        case RoadTileType.ALONE:
            return [];
        case RoadTileType.UP:
            return [Direction.UP];
        case RoadTileType.RIGHT:
            return [Direction.RIGHT];
        case RoadTileType.DOWN:
            return [Direction.DOWN];
        case RoadTileType.LEFT:
            return [Direction.LEFT];
        case RoadTileType.UP_RIGHT:
            return [Direction.UP, Direction.RIGHT];
        case RoadTileType.RIGHT_DOWN:
            return [Direction.RIGHT, Direction.DOWN];
        case RoadTileType.DOWN_LEFT:
            return [Direction.DOWN, Direction.LEFT];
        case RoadTileType.UP_LEFT:
            return [Direction.UP, Direction.LEFT];
        case RoadTileType.UP_DOWN:
            return [Direction.UP, Direction.DOWN];
        case RoadTileType.RIGHT_LEFT:
            return [Direction.RIGHT, Direction.LEFT];
        case RoadTileType.UP_RIGHT_DOWN:
            return [Direction.UP, Direction.RIGHT, Direction.DOWN];
        case RoadTileType.RIGHT_DOWN_LEFT:
            return [Direction.RIGHT, Direction.DOWN, Direction.LEFT];
        case RoadTileType.UP_DOWN_LEFT:
            return [Direction.UP, Direction.DOWN, Direction.LEFT];
        case RoadTileType.UP_RIGHT_LEFT:
            return [Direction.UP, Direction.RIGHT, Direction.LEFT];
        case RoadTileType.UP_RIGHT_DOWN_LEFT:
            return [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];
    }
}

export function RoadTile(props) {
    return (
        <div>
            <p className='road-tile-descriptor'>{props.displayRoadTileDescriptor ? props.type : ''}</p>
            <div className={`road-tile road-tile${props.type}`}></div>
        </div >
    );
}

RoadTile.propTypes = {
    displayRoadTileDescriptor: PropTypes.bool.isRequired,
    type: PropTypes.number.isRequired,
}