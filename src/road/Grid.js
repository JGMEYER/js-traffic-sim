import './road.css';
import { RoadTile, RoadTileType } from './RoadTile.js';

export function Grid() {
    const width = getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-width');
    const height = getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-height');

    const populateGridTiles = () => {
        let gridTiles = [];
        for (let r = 0; r < height; r++) {
            gridTiles.push([]);
            for (let c = 0; c < width; c++) {
                const idx = r * width + c;
                gridTiles[r].push(
                    <div className='grid-tile'>
                        <RoadTile type={RoadTileType.EMPTY} />
                    </div>
                );
            }
        }
        return gridTiles;
    };

    return (
        <div className="grid-wrapper">
            {populateGridTiles()}
        </div>
    );
}