import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-lineto';
import Graph from 'graph-data-structure';

import '../common/common.css';
import { Direction, oppositeDirection } from '../common/common';
import { getSegmentDirectionsForRoadTileType } from './RoadTile';

export const TravelNodeType = {
    ENTER: 0,
    EXIT: 1,
};
Object.freeze(TravelNodeType);

export class TravelNode {
    static count = 0;

    constructor(row, col, direction, travelNodeType) {
        this.id = TravelNode.count++;

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

/**
 * An intersection on the TileGrid comprised of nodes on the TravelGraph
 * that represents all ENTER and EXIT travel nodes for the given tile.
 *
 * Each road segment on a tile (i.e. UP, RIGHT, DOWN, LEFT) has an ENTER and
 * EXIT node denoting where traffic flows into and out of the tile,
 * respectively.
 *
 * Structure:
 *     self.nodes = {
 *         Direction: {
 *             TravelNodeType.ENTER: TravelNode,
 *             TravelNodeType.EXIT: TravelNode,
 *         },
 *         ..
 *     }
 */
export class TravelIntersection {
    constructor(row, col, tileType) {
        this.row = row;
        this.col = col;
        this.nodes = {};

        getSegmentDirectionsForRoadTileType(tileType).forEach(
            direction => { this.addTravelNodes(direction) }
        );
    }

    addTravelNodes(direction) {
        this.nodes[direction] = {}
        this.nodes[direction][TravelNodeType.EXIT] =
            new TravelNode(this.row, this.col, direction, TravelNodeType.EXIT);
        this.nodes[direction][TravelNodeType.ENTER] =
            new TravelNode(this.row, this.col, direction, TravelNodeType.ENTER);
    }

    getSegmentDirections() {
        return Object.keys(this.nodes);
    }

    getEnterNodes() {
        const enterNodes = [];
        this.getSegmentDirections().forEach(direction => {
            enterNodes.push(this.nodes[direction][TravelNodeType.ENTER]);
        });
        return enterNodes;
    }

    getExitNodes() {
        const exitNodes = [];
        this.getSegmentDirections().forEach(direction => {
            exitNodes.push(this.nodes[direction][TravelNodeType.EXIT]);
        });
        return exitNodes;
    }

    getNodesForSegment(direction) {
        return [
            this.nodes[direction][TravelNodeType.EXIT],
            this.nodes[direction][TravelNodeType.ENTER],
        ];
    }
}

export class TravelGraph {
    constructor(graph, nodes, intersections) {
        this.graph = graph || new Graph();
        this.nodes = nodes || {};
        this.intersections = intersections || {};
    }

    getNode(idString) {
        return this.nodes[idString];
    }

    getEdges() {
        return this.graph.serialize().links;
    }

    registerTravelIntersection(r, c, roadTileType, neighbors) {
        const insct = new TravelIntersection(r, c, roadTileType);
        this._intraconnectRoads(insct);

        // Neighbor intersections will have a new segment added to their tile to
        // bridge the connection to the newly placed tile. Add ENTER and EXIT
        // nodes to all neighbor's new segments and recompute their
        // intraconnected edges to account for this update.
        for (const nDirection in neighbors) {
            const neighbor = neighbors[nDirection];
            const nR = neighbor.coords[0];
            const nC = neighbor.coords[1];

            const nInsct = this.intersections[[nR, nC]];
            nInsct.addTravelNodes(oppositeDirection(nDirection));
            this._updateIntersectionIntraconnectedEdges(nInsct);
        }

        // Add edges between intersection and neighbor intersections
        for (const nDirection in neighbors) {
            const neighbor = neighbors[nDirection];
            const nR = neighbor.coords[0];
            const nC = neighbor.coords[1];

            const nInsct = this.intersections[[nR, nC]];

            let exit, enter;
            let nExit, nEnter;
            [exit, enter] = insct.getNodesForSegment(nDirection);
            [nExit, nEnter] = nInsct.getNodesForSegment(oppositeDirection(nDirection));

            this._addEdge(exit, nEnter);
            this._addEdge(nExit, enter);
        }

        this.intersections[[r, c]] = insct;
    }

    _addEdge(exit, enter) {
        // This graph implementation only allows string nodes
        this.graph.addEdge(exit.id.toString(), enter.id.toString());
        // Create way to reference these nodes later
        this.nodes[exit.id.toString()] = exit;
        this.nodes[enter.id.toString()] = enter;
    }

    _removeEdge(exit, enter) {
        // This graph implementation only allows string nodes
        this.graph.removeEdge(exit.id.toString(), enter.id.toString());
        // TODO for proper removal, remove nodes from this.nodes if
        // indegree and outdegree length === 0
    }

    _intraconnectRoads(insct) {
        const segmentDirections = insct.getSegmentDirections();

        if (segmentDirections.length === 1) {
            // Only one segment. Connect the two nodes, so vehicles can make a
            // U-Turn at dead-ends.
            let exit, enter;
            [exit, enter] = insct.getNodesForSegment(segmentDirections[0]);
            this._addEdge(exit, enter);

        } else {
            // Connect segments' ENTER nodes to other segments' EXIT nodes
            // This is overkill when we're updating an intersection since most edges
            // already exist, but since this likely only happens on a player action
            // and not in the game loop we're ok with the efficiency hit.
            insct.getEnterNodes().forEach(enter => {
                insct.getExitNodes().forEach(exit => {
                    if (exit.direction !== enter.direction) {
                        this._addEdge(exit, enter);
                    }
                })
            });
        }
    }

    /**
     * Update existing intersection's edges to match desired configuration
     * for current set of nodes.
     *
     * Should only be used on existing intersections in the graph that have
     * been updated via a road adjacent to it, i.e. do not run this for newly
     * placed dead-end tiles.
     */
    _updateIntersectionIntraconnectedEdges(insct) {
        // Clear all self-connected edges from existing dead-end segments
        // We don't know which one was newly added, so go through each segment
        // and try removing any self-connections
        insct.getSegmentDirections().forEach(direction => {
            let exit, enter;
            [exit, enter] = insct.getNodesForSegment(direction);
            this._removeEdge(exit, enter);
        });

        this._intraconnectRoads(insct);
    }
}

export class TravelEdge extends React.Component {
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
};

export class TravelGraphComponent extends React.Component {
    render() {
        const travelGraph = this.props.travelGraph;
        // TODO This is bad. Relies too much on the inner workings of the graph
        return (
            <div>
                {travelGraph.getEdges().map((edge, idx) => {
                    const exitNode = travelGraph.getNode(edge.source);
                    const enterNode = travelGraph.getNode(edge.target);
                    return <TravelEdge exitNode={exitNode} enterNode={enterNode} />
                })}
            </div>
        );
    }
}

TravelGraphComponent.propTypes = {
    travelGraph: PropTypes.object.isRequired,
};