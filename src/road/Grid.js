import React, { useEffect, useState } from 'react';
import { Direction } from '../common/common';

import './road.css';
import { RoadTile, RoadTileType } from './RoadTile.js';

export function Grid() {
    const width = getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-width');
    const height = getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-height');

    const [roadTiles, setRoadTiles] = useState([])
    const [roadTileDivs, setRoadTileDivs] = useState([])

    const getNeighbors = (r, c) => {
        const neighbors = {};
        if (r - 1 >= 0 && roadTiles[r - 1][c].type !== RoadTileType.EMPTY) {
            neighbors[Direction.UP] = {
                coords: [r - 1, c],
                type: roadTiles[r - 1][c].type,
            }
        }
        if (c + 1 < width && roadTiles[r][c + 1].type !== RoadTileType.EMPTY) {
            neighbors[Direction.RIGHT] = {
                coords: [r, c + 1],
                type: roadTiles[r][c + 1].type,
            }
        }
        if (r + 1 < height && roadTiles[r + 1][c].type !== RoadTileType.EMPTY) {
            neighbors[Direction.DOWN] = {
                coords: [r + 1, c],
                type: roadTiles[r + 1][c].type,
            }
        }
        if (c - 1 >= 0 && roadTiles[r][c - 1].type !== RoadTileType.EMPTY) {
            neighbors[Direction.LEFT] = {
                coords: [r, c - 1],
                type: roadTiles[r][c - 1].type,
            }
        }
        console.log(neighbors);
        return neighbors;
    }

    const populateRoadTiles = () => {
        const baseRoadTiles = new Array(height);
        for (let r = 0; r < height; r++) {
            baseRoadTiles[r] = new Array(width);
        }
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                baseRoadTiles[r][c] = (
                    <RoadTile type={RoadTileType.UP_RIGHT_DOWN_LEFT} />
                );
            }
        }
        setRoadTiles(baseRoadTiles);
    };

    const populateRoadTileDivs = () => {
        const baseRoadTileDivs = []
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                baseRoadTileDivs.push((
                    <div
                        key={`grid-tile${r * width + c}`}
                        className='grid-tile'
                        onClick={() => getNeighbors(r, c)}>
                        {roadTiles[r][c]}
                    </div>
                ));
            }
        }
        setRoadTileDivs(baseRoadTileDivs);
    }

    useEffect(() => {
        populateRoadTiles();
    }, []);

    useEffect(() => {
        // ignore initial set* of roadTiles in useState()
        if (roadTiles && roadTiles.length) {
            populateRoadTileDivs();
        }
    }, [roadTiles]);

    return (
        <div className="grid-wrapper">
            {roadTileDivs}
        </div>
    );
}