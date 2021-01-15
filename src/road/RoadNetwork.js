import React from 'react'
import PropTypes from 'prop-types';

import { RoadTileMatrix, Grid } from './Grid';
import { Traffic, TrafficComponent } from './Traffic';
import { TravelGraph, TravelGraphComponent } from './TravelGraph';

export class RoadNetwork extends React.Component {
    constructor(props) {
        super(props);

        const rows = this.props.rows;
        const cols = this.props.cols;

        this.state = {
            roadTileMatrix: new RoadTileMatrix(rows, cols, null),
            travelGraph: new TravelGraph(null, null, null),
            traffic: new Traffic([]),
        };

        const middleRow = Math.floor(rows / 2)
        const middleCol = Math.floor(cols / 2);
        this.addRoad(middleRow, middleCol, false);

        this.addRoad = this.addRoad.bind(this);
    }

    componentDidMount() {
        const step = this.step.bind(this);
        this.intervalId = setInterval(function () {
            step();
        }, 75);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    step() {
        this.state.traffic.step(this.state.travelGraph);

        // Force any re-renders from changed Traffic
        const vehicles = this.state.traffic.vehicles;
        const newTraffic = new Traffic(vehicles);
        this.setState(prev => ({
            ...prev,
            traffic: newTraffic,
        }));
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

        // Add vehicle to random node
        if (Math.floor(Math.random() * 100) < 40) {
            const randNode = this.state.travelGraph.getRandomNode();
            if (randNode) {
                this.state.traffic.addVehicle(randNode);
            }
        }

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

        // Force any re-renders from changed Traffic
        const vehicles = this.state.traffic.vehicles;
        const newTraffic = new Traffic(vehicles);

        this.setState({
            roadTileMatrix: newRoadTileMatrix,
            travelGraph: newTravelGraph,
            traffic: newTraffic,
        });
    }

    render() {
        const roadTileMatrix = this.state.roadTileMatrix;
        const addRoad = this.addRoad;
        const globalSettings = this.props.globalSettings;
        const travelGraph = this.state.travelGraph;
        const traffic = this.state.traffic;
        return (
            <div>
                <Grid
                    globalSettings={globalSettings}
                    roadTileMatrix={roadTileMatrix}
                    addRoad={addRoad} />
                <TravelGraphComponent
                    globalSettings={globalSettings}
                    travelGraph={travelGraph} />
                <TrafficComponent
                    globalSettings={globalSettings}
                    traffic={traffic}
                />
            </div>
        );
    };
}

RoadNetwork.propTypes = {
    globalSettings: PropTypes.object.isRequired,
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
}