import React from 'react';
import PropTypes from 'prop-types';

import './Grid.css';
import { RoadTile, RoadTileType } from '../RoadTile/RoadTile';
import { Direction } from '../../util/Direction';

export class RoadTileMatrix {
    constructor(rows, cols, innerArray) {
        // If no array provided, populate it.
        if (!innerArray) {
            innerArray = new Array(rows);
            for (let r = 0; r < rows; r++) {
                innerArray[r] = new Array(cols);
            }
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    innerArray[r][c] = RoadTileType.EMPTY;
                }
            }
        }

        this.rows = rows;
        this.cols = cols;
        this.innerArray = innerArray;
    }

    get(r, c) {
        return this.innerArray[r][c];
    }

    getNeighbors(r, c) {
        const neighbors = {};
        if (r - 1 >= 0 && this.innerArray[r - 1][c] !== RoadTileType.EMPTY) {
            neighbors[Direction.UP] = {
                coords: [r - 1, c],
                type: this.innerArray[r - 1][c],
            }
        }
        if (c + 1 < this.cols && this.innerArray[r][c + 1] !== RoadTileType.EMPTY) {
            neighbors[Direction.RIGHT] = {
                coords: [r, c + 1],
                type: this.innerArray[r][c + 1],
            }
        }
        if (r + 1 < this.rows && this.innerArray[r + 1][c] !== RoadTileType.EMPTY) {
            neighbors[Direction.DOWN] = {
                coords: [r + 1, c],
                type: this.innerArray[r + 1][c],
            }
        }
        if (c - 1 >= 0 && this.innerArray[r][c - 1] !== RoadTileType.EMPTY) {
            neighbors[Direction.LEFT] = {
                coords: [r, c - 1],
                type: this.innerArray[r][c - 1],
            }
        }
        return neighbors;
    }

    hasNeighbors(r, c) {
        return Object.keys(this.getNeighbors(r, c)).length > 0;
    }

    evaluateRoadTileType(r, c, wasAdded) {
        /* wasAdded: whether the road tile was newly added to the grid, i.e.
                     changed from RoadTileType.EMPTY */

        // Optimization: don't update empty spaces unless we recently added a
        // tile there.
        if (!wasAdded && this.innerArray[r][c] === RoadTileType.EMPTY) {
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

    /**
     * Update tile type.
     * @param {number} row
     * @param {number} col
     * @param {boolean} wasAdded Whether the RoadTile was newly added to the
     *                  grid, i.e. changed from RoadTileType.EMPTY.
     */
    updateTile(r, c, wasAdded) {
        this.innerArray[r][c] = this.evaluateRoadTileType(r, c, wasAdded)
    }

    _updateNeighbors(r, c, wasAdded) {
        if (r - 1 >= 0) {
            this.updateTile(r - 1, c, wasAdded);
        }
        if (c + 1 < this.cols) {
            this.updateTile(r, c + 1, wasAdded);
        }
        if (r + 1 < this.rows) {
            this.updateTile(r + 1, c, wasAdded);
        }
        if (c - 1 >= 0) {
            this.updateTile(r, c - 1, wasAdded);
        }
    }

    /**
     * Add tile.
     * @param {number} row
     * @param {number} col
     * @param {boolean} restrictToNeighbors Tile must be placed next to another
     *                  tile.
     * @returns {boolean} Tile was added.
     */
    addTile(r, c, restrictToNeighbors) {
        if (this.innerArray[r][c] !== RoadTileType.EMPTY) {
            return false;
        }
        if (restrictToNeighbors && !this.hasNeighbors(r, c)) {
            return false;
        }
        this.updateTile(r, c, true);
        this._updateNeighbors(r, c, false);
        return true;
    }

    tileCanBeRemoved(r, c) {
        return this.innerArray[r][c] !== RoadTileType.EMPTY;
    }

    /**
     * Remove tile.
     * @param {number} row
     * @param {number} col
     */
    removeTile(r, c) {
        this.innerArray[r][c] = RoadTileType.EMPTY;
        this._updateNeighbors(r, c, false);
    }
}

export class Grid extends React.Component {
    mouseDownHandler(e, r, c) {
        e.preventDefault();
        switch (e.buttons) {
            case 1:
                this.props.addRoad(r, c, false);
                break;
            case 2:
                this.props.removeRoad(r, c);
                break;
            default:
                break;
        }
    }

    mouseOverHandler({ buttons }, r, c) {
        switch (buttons) {
            case 1:
                this.props.addRoad(r, c, false);
                break;
            case 2:
                this.props.removeRoad(r, c);
                break;
            default:
                break;
        }
    }

    render() {
        const globalSettings = this.props.globalSettings;
        const roadTileMatrix = this.props.roadTileMatrix;
        const rows = roadTileMatrix.rows;
        const cols = roadTileMatrix.cols;

        const roadTileDivs = []

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                roadTileDivs.push((
                    <div
                        key={`grid-tile${r * cols + c}`}
                        className='grid-tile'
                        onMouseDown={(e) => this.mouseDownHandler(e, r, c)}
                        onMouseOver={(e) => this.mouseOverHandler(e, r, c)}
                        onContextMenu={
                            /* disable right click context menu */
                            (e) => e.preventDefault()
                        }>
                        <RoadTile
                            displayRoadTileDescriptor={globalSettings.displayRoadTileDescriptors}
                            type={roadTileMatrix.get(r, c)} />
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

Grid.propTypes = {
    globalSettings: PropTypes.object.isRequired,
    roadTileMatrix: PropTypes.object.isRequired,
    addRoad: PropTypes.func.isRequired,
    removeRoad: PropTypes.func.isRequired,
}