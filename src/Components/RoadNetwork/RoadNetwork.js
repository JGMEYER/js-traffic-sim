import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types';

import { RoadTileMatrix, Grid } from '../Grid/Grid';
import { Traffic, TrafficComponent } from '../Traffic/Traffic';
import { TravelGraph, TravelGraphComponent } from '../TravelGraph/TravelGraph';

export function RoadNetwork(props) {
    const [roadTileMatrix, setRoadTileMatrix] = useState(
        new RoadTileMatrix(props.rows, props.cols, null)
    )
    const [travelGraph, setTravelGraph] = useState(
        new TravelGraph(null, null, null)
    )
    const [traffic, setTraffic] = useState(
        new Traffic([], {})
    )
    const [lastTimeMillisec, setLastTimeMillisec] = useState(Date.now());

    // Initialize starting road tile
    useEffect(() => {
        const middleRow = Math.floor(props.rows / 2)
        const middleCol = Math.floor(props.cols / 2);
        addRoad(middleRow, middleCol, false);
    }, []);

    // Initialize step interval
    useEffect(() => {
        const intervalId = setInterval(() => {
            step();
        }, 16); // ~30fps
        return () => clearInterval(intervalId);
    });

    function step() {
        const curTimeMillisec = Date.now();
        const tickMillisec = curTimeMillisec - lastTimeMillisec;
        traffic.step(tickMillisec, travelGraph, roadTileMatrix);

        // Force any re-renders from changed Traffic
        const newTraffic = new Traffic(traffic.vehicles, traffic.inscts);
        setTraffic(newTraffic);

        setLastTimeMillisec(curTimeMillisec);
    }

    function addRoad(r, c, restrictToNeighbors) {
        // Try to add tile
        const tileAdded = roadTileMatrix.addTile(r, c, restrictToNeighbors);
        if (!tileAdded) {
            return;
        }

        // Update graph
        const roadTileType = roadTileMatrix.get(r, c);
        const neighbors = roadTileMatrix.getNeighbors(r, c);
        travelGraph.registerTravelIntersection(r, c, roadTileType, neighbors);

        // Add vehicle to newest node with random chance
        if (Math.floor(Math.random() * 100) < 40) {
            const newestNode = travelGraph.getNewestNode();
            if (newestNode) {
                traffic.addVehicle(newestNode);
            }
        }

        // Force any re-renders from changed RoadTileMatrix
        const newRoadTileMatrix = new RoadTileMatrix(
            props.rows,
            props.cols,
            roadTileMatrix.innerArray
        );
        setRoadTileMatrix(newRoadTileMatrix);

        // Force any re-renders from changed TravelGraph
        const graph = travelGraph.graph;
        const nodes = travelGraph.nodes;
        const intersections = travelGraph.intersections;
        const newTravelGraph = new TravelGraph(graph, nodes, intersections);
        setTravelGraph(newTravelGraph);

        // Force any re-renders from changed Traffic
        const newTraffic = new Traffic(traffic.vehicles, traffic.inscts);
        setTraffic(newTraffic);
    }

    return (
        <div>
            <Grid
                globalSettings={props.globalSettings}
                roadTileMatrix={roadTileMatrix}
                addRoad={addRoad} />
            <TravelGraphComponent
                globalSettings={props.globalSettings}
                travelGraph={travelGraph} />
            <TrafficComponent
                globalSettings={props.globalSettings}
                traffic={traffic}
            />
        </div>
    );
}

RoadNetwork.propTypes = {
    globalSettings: PropTypes.object.isRequired,
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
}