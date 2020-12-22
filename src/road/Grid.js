import React, { useState } from 'react';

import './road.css';
import { RoadTile, RoadTileType } from './RoadTile.js';

export function Grid() {
    const width = getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-width');
    const height = getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-height');

    const populateRoadTiles = () => {
        let roadTiles = new Array(height);
        for (let r = 0; r < height; r++) {
            roadTiles[r] = new Array(width);
        }
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                roadTiles[r][c] = <RoadTile type={RoadTileType.EMPTY} />;
            }
        }
        return roadTiles;
    };

    const [roadTiles, setRoadTiles] = useState(
        populateRoadTiles()
    );

    const renderRoadTiles = () => {
        let roadTileDivs = []
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                roadTileDivs.push((
                    <div className='grid-tile'>
                        {roadTiles[r][c]}
                    </div>
                ));
            }
        }
        return roadTileDivs;
    }

    return (
        <div className="grid-wrapper">
            {renderRoadTiles()}
        </div>
    );
}