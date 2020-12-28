import React from 'react';

import './Grid.css';
import { RoadTile, RoadTileType } from './RoadTile';
import { Direction } from '../common/common';

export class GridContainer extends React.Component {
    constructor(props) {
        super(props);

        const roadTileTypes = new Array(props.rows);
        for (let r = 0; r < props.rows; r++) {
            roadTileTypes[r] = new Array(props.cols);
        }
        for (let r = 0; r < props.rows; r++) {
            for (let c = 0; c < props.cols; c++) {
                roadTileTypes[r][c] = RoadTileType.EMPTY;
            }
        }

        const middleRow = Math.floor(props.rows / 2)
        const middleCol = Math.floor(props.cols / 2);
        roadTileTypes[middleRow][middleCol] = RoadTileType.ALONE;

        this.state = {
            roadTileTypes: roadTileTypes,
        }

        this.addTile = this.addTile.bind(this);
    }

    getNeighbors(r, c) {
        const neighbors = {};
        if (r - 1 >= 0 && this.state.roadTileTypes[r - 1][c] !== RoadTileType.EMPTY) {
            neighbors[Direction.UP] = {
                coords: [r - 1, c],
                type: this.state.roadTileTypes[r - 1][c],
            }
        }
        if (c + 1 < this.props.cols && this.state.roadTileTypes[r][c + 1] !== RoadTileType.EMPTY) {
            neighbors[Direction.RIGHT] = {
                coords: [r, c + 1],
                type: this.state.roadTileTypes[r][c + 1],
            }
        }
        if (r + 1 < this.props.rows && this.state.roadTileTypes[r + 1][c] !== RoadTileType.EMPTY) {
            neighbors[Direction.DOWN] = {
                coords: [r + 1, c],
                type: this.state.roadTileTypes[r + 1][c],
            }
        }
        if (c - 1 >= 0 && this.state.roadTileTypes[r][c - 1] !== RoadTileType.EMPTY) {
            neighbors[Direction.LEFT] = {
                coords: [r, c - 1],
                type: this.state.roadTileTypes[r][c - 1],
            }
        }
        return neighbors;
    }

    evaluateRoadTileType(r, c, wasAdded) {
        /* wasAdded: whether the road tile was newly added to the grid, i.e.
                     changed from RoadTileType.EMPTY */

        // Optimization: don't update empty spaces unless we recently added a
        // tile there.
        if (!wasAdded && this.state.roadTileTypes[r][c] === RoadTileType.EMPTY) {
            return RoadTileType.EMPTY;
        }

        const neighbors = this.getNeighbors(r, c)
        const numNeighbors = Object.keys(neighbors).length;
        const up = typeof neighbors[Direction.UP] !== 'undefined';
        const right = typeof neighbors[Direction.RIGHT] !== 'undefined';
        const down = typeof neighbors[Direction.DOWN] !== 'undefined';
        const left = typeof neighbors[Direction.LEFT] !== 'undefined';

        if (numNeighbors === 0) {
            return RoadTileType.ALONE;
        } else if (numNeighbors === 1) {
            if (up) {
                return RoadTileType.UP;
            } else if (right) {
                return RoadTileType.RIGHT;
            } else if (down) {
                return RoadTileType.DOWN;
            } else if (left) {
                return RoadTileType.LEFT;
            }
        } else if (numNeighbors === 2) {
            if (up && right) {
                return RoadTileType.UP_RIGHT;
            } else if (right && down) {
                return RoadTileType.RIGHT_DOWN;
            } else if (down && left) {
                return RoadTileType.DOWN_LEFT;
            } else if (up && left) {
                return RoadTileType.UP_LEFT;
            } else if (up && down) {
                return RoadTileType.UP_DOWN;
            } else if (right && left) {
                return RoadTileType.RIGHT_LEFT;
            }
        } else if (numNeighbors === 3) {
            if (up && right && down) {
                return RoadTileType.UP_RIGHT_DOWN;
            } else if (right && down && left) {
                return RoadTileType.RIGHT_DOWN_LEFT;
            } else if (up && down && left) {
                return RoadTileType.UP_DOWN_LEFT;
            } else if (up && right && left) {
                return RoadTileType.UP_RIGHT_LEFT;
            }
        } else if (numNeighbors === 4) {
            return RoadTileType.UP_RIGHT_DOWN_LEFT;
        }
    }

    updateTileType(r, c, wasAdded) {
        // Hack? - change and force re-render
        this.state.roadTileTypes[r][c] = this.evaluateRoadTileType(r, c, wasAdded);
        this.setState({ roadTileTypes: this.state.roadTileTypes });
    }

    addTile(r, c, restrict_to_neighbors) {
        /* Add tile to grid
        restrict_to_neighbors - only allow road to be placed next to an
                                existing tile */
        if (this.state.roadTileTypes[r][c] !== RoadTileType.EMPTY) {
            return false;
        }
        if (restrict_to_neighbors && !Object.keys(this.getNeighbors(r, c)).length) {
            return false;
        }

        this.updateTileType(r, c, true);

        if (r - 1 >= 0) {
            this.updateTileType(r - 1, c, false);
        }
        if (c + 1 < this.props.cols) {
            this.updateTileType(r, c + 1, false);
        }
        if (r + 1 < this.props.rows) {
            this.updateTileType(r + 1, c, false);
        }
        if (c - 1 >= 0) {
            this.updateTileType(r, c - 1, false);
        }

        return true;
    }

    render() {
        return <Grid
            rows={this.props.rows}
            cols={this.props.cols}
            roadTileTypes={this.state.roadTileTypes}
            addTile={this.addTile} />;
    }
}

class Grid extends React.Component {
    render() {
        const roadTileDivs = []
        let rows = this.props.roadTileTypes.length;
        for (let r = 0; r < rows; r++) {
            let cols = this.props.roadTileTypes[r].length;
            for (let c = 0; c < cols; c++) {
                roadTileDivs.push((
                    <div
                        key={`grid-tile${r * cols + c}`}
                        className='grid-tile'
                        onMouseOver={() => this.props.addTile(r, c, true)} >
                        <RoadTile type={this.props.roadTileTypes[r][c]} />
                    </div >
                ));
            }
        }
        return (
            <div className="grid-wrapper">
                {roadTileDivs}
            </div>
        );
    }
}