import React from 'react';
import PropTypes from 'prop-types';

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

export function RoadTile(props) {
    return (
        <div>
            <p className='road-tile-descriptor'>{props.type}</p>
            <div className={`road-tile road-tile${props.type}`}></div>
        </div>
    );
}

RoadTile.propTypes = {
    type: PropTypes.number.isRequired,
}