import React from 'react'
import PropTypes from 'prop-types';

import { RoadTileMatrix, Grid } from './Grid';
import { TravelGraph, TravelGraphComponent } from './TravelGraph';

export class RoadNetwork extends React.Component {
    constructor(props) {
        super(props);

        const rows = this.props.rows;
        const cols = this.props.cols;

        this.state = {
            roadTileMatrix: new RoadTileMatrix(rows, cols, null),
            travelGraph: new TravelGraph(null, null, null),
        };

        const middleRow = Math.floor(rows / 2)
        const middleCol = Math.floor(cols / 2);
        this.addRoad(middleRow, middleCol, false);

        this.addRoad = this.addRoad.bind(this);
    }

    addRoad(r, c, restrictToNeighbors) {
        // Try to add tile
        const tileAdded = this.state.roadTileMatrix.addTile(r, c, restrictToNeighbors);

        if (!tileAdded) {
            return;
        }

        // Update graph
        const roadTileType = this.state.roadTileMatrix.get(r, c);
        const neighbors = this.state.roadTileMatrix.getNeighbors(r, c);
        this.state.travelGraph.registerTravelIntersection(r, c, roadTileType, neighbors);

        // Force any re-renders from changed RoadTileMatrix
        const rows = this.props.rows;
        const cols = this.props.cols;
        const innerArray = this.state.roadTileMatrix.innerArray;
        const newRoadTileMatrix = new RoadTileMatrix(rows, cols, innerArray);

        // Force any re-renders from changed TravelGraph
        const graph = this.state.travelGraph.graph;
        const nodes = this.state.travelGraph.nodes;
        const intersections = this.state.travelGraph.intersections;
        const newTravelGraph = new TravelGraph(graph, nodes, intersections);

        this.setState({
            roadTileMatrix: newRoadTileMatrix,
            travelGraph: newTravelGraph,
        });
    }

    render() {
        const roadTileMatrix = this.state.roadTileMatrix;
        const addRoad = this.addRoad;
        const globalSettings = this.props.globalSettings;
        const travelGraph = this.state.travelGraph;
        return (
            <div>
                <Grid roadTileMatrix={roadTileMatrix} addRoad={addRoad} />
                <TravelGraphComponent globalSettings={globalSettings} travelGraph={travelGraph} />
            </div>
        );
    };
}

RoadNetwork.propTypes = {
    globalSettings: PropTypes.object.isRequired,
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
}