import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-lineto';
import Graph from 'graph-data-structure';

import './TravelGraph.css';
import { getSegmentDirectionsForRoadTileType } from '../RoadTile/RoadTile';
import { Direction, oppositeDirection } from '../../util/Direction';

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
            this.y -= tileHeight / 3;
            if (this.travelNodeType === TravelNodeType.ENTER) {
                this.x -= tileWidth / 8;
            } else if (this.travelNodeType === TravelNodeType.EXIT) {
                this.x += tileWidth / 8;
            }
        } else if (this.direction === Direction.RIGHT) {
            this.x += tileWidth / 3;
            if (this.travelNodeType === TravelNodeType.ENTER) {
                this.y -= tileHeight / 8;
            } else if (this.travelNodeType === TravelNodeType.EXIT) {
                this.y += tileHeight / 8;
            }
        } else if (this.direction === Direction.DOWN) {
            this.y += tileHeight / 3;
            if (this.travelNodeType === TravelNodeType.ENTER) {
                this.x += tileWidth / 8;
            } else if (this.travelNodeType === TravelNodeType.EXIT) {
                this.x -= tileWidth / 8;
            }
        } else if (this.direction === Direction.LEFT) {
            this.x -= tileWidth / 3;
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

    getNodes() {
        return this.nodes;
    }

    getNewestNode() {
        if (Object.keys(this.nodes).length === 0) {
            return null;
        }
        const newestKey = Object.keys(this.nodes).reduce(
            (a, b) => Number(a) > Number(b) ? a : b
        );
        return this.nodes[newestKey];
    }

    getRandomNode() {
        const randNodeIdString = Math.floor(Math.random() * Object.keys(this.nodes).length);
        const randNode = this.getNode(randNodeIdString);
        return randNode;
    }

    getEdges() {
        return this.graph.serialize().links;
    }

    getShortestPath(startNodeId, endNodeId) {
        return this.graph.shortestPath(
            startNodeId.toString(),
            endNodeId.toString()
        );
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

            const [exit, enter] = insct.getNodesForSegment(nDirection);
            const [nExit, nEnter] = nInsct.getNodesForSegment(oppositeDirection(nDirection));

            this._addEdge(exit, nEnter);
            this._addEdge(nExit, enter);
        }

        this.intersections[[r, c]] = insct;
    }

    _addEdge(exit, enter) {
        // Note: This graph implementation only allows string nodes

        // Ignore if edge already exists
        const exitAdjacentNodes = this.graph.adjacent(exit.id.toString());
        const edgeAlreadyExists = exitAdjacentNodes.indexOf(enter.id.toString()) !== -1;
        if (edgeAlreadyExists) {
            return;
        }

        this.graph.addEdge(exit.id.toString(), enter.id.toString());

        // Create way to reference these nodes later
        this.nodes[exit.id.toString()] = exit;
        this.nodes[enter.id.toString()] = enter;
    }

    _removeEdge(exit, enter) {
        // Note: This graph implementation only allows string nodes

        this.graph.removeEdge(exit.id.toString(), enter.id.toString());
        // TODO for proper removal, remove nodes from this.nodes if
        // indegree and outdegree length === 0
    }

    _intraconnectRoads(insct) {
        const segmentDirections = insct.getSegmentDirections();

        if (segmentDirections.length === 1) {
            // Only one segment. Connect the two nodes, so vehicles can make a
            // U-Turn at dead-ends.
            const [exit, enter] = insct.getNodesForSegment(segmentDirections[0]);
            this._addEdge(enter, exit);

        } else {
            // Connect segments' ENTER nodes to other segments' EXIT nodes
            // This is overkill when we're updating an intersection since most edges
            // already exist, but since this likely only happens on a player action
            // and not in the game loop we're ok with the efficiency hit.
            insct.getEnterNodes().forEach(enter => {
                insct.getExitNodes().forEach(exit => {
                    if (exit.direction !== enter.direction) {
                        this._addEdge(enter, exit);
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
            const [exit, enter] = insct.getNodesForSegment(direction);
            this._removeEdge(enter, exit);
        });

        this._intraconnectRoads(insct);
    }
}

export class TravelEdge extends React.Component {
    render() {
        const exitNode = this.props.exitNode;
        const enterNode = this.props.enterNode;
        return (
            <div>
                <p
                    className="node-label"
                    style={{
                        top: `${exitNode.y}px`,
                        left: `${exitNode.x}px`,
                    }}
                >
                    {exitNode.id}
                </p>
                <Line
                    x0={exitNode.x}
                    y0={exitNode.y}
                    x1={enterNode.x}
                    y1={enterNode.y} />
            </div >
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
        const globalSettings = this.props.globalSettings;
        if (globalSettings.displayTravelEdges) {
            // TODO This is bad. Relies too much on the inner workings of the graph
            return (
                <div>
                    {travelGraph.getEdges().map((edge, idx) => {
                        const exitNode = travelGraph.getNode(edge.source);
                        const enterNode = travelGraph.getNode(edge.target);
                        return (
                            <TravelEdge
                                key={`travel-edge-${exitNode.id}-${enterNode.id}`}
                                exitNode={exitNode} enterNode={enterNode} />
                        );
                    })}
                </div>
            );
        } else {
            return <div></div>;
        }
    }
}

TravelGraphComponent.propTypes = {
    globalSettings: PropTypes.object.isRequired,
    travelGraph: PropTypes.object.isRequired,
};