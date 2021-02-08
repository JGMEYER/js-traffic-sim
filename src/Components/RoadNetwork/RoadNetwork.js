import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types';

import { RoadTileMatrix, Grid } from '../Grid/Grid';
import { Traffic, TrafficComponent } from '../Traffic/Traffic';
import { TravelGraph, TravelGraphComponent } from '../TravelGraph/TravelGraph';

/**
 * Main component for controlling the flow of the simulation.
 * @param {Object} props
 */
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

    // Initialize step interval
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!document.hidden) {
                step();
            } else {
                setLastTimeMillisec(Date.now());
            }
        }, 16); // ~30fps
        return () => clearInterval(intervalId);
    });

    /**
     * Step Components in the road network a set amount of milliseconds.
     */
    function step() {
        const curTimeMillisec = Date.now();
        const tickMillisec = curTimeMillisec - lastTimeMillisec;
        traffic.step(tickMillisec, travelGraph, roadTileMatrix);

        // Force any re-renders from changed Traffic
        const newTraffic = new Traffic(traffic.vehicles, traffic.inscts);
        setTraffic(newTraffic);

        setLastTimeMillisec(curTimeMillisec);
    }

    /**
     * Add road and randomly generate vehicles.
     * @param {number} row
     * @param {number} col
     * @param {boolean} restrictToNeighbors
     */
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

        // Prevents strange behavior where vehicle could otherwise travel
        // across TravelGraph edges that no longer exist.
        traffic.rerandomizeAllVehiclePaths(travelGraph);

        rerender();
    }

    /**
     * Remove road and nearby vehicles.
     * @param {number} r
     * @param {number} c
     */
    function removeRoad(r, c) {
        if (!roadTileMatrix.tileCanBeRemoved(r, c)) {
            return;
        }

        const neighbors = roadTileMatrix.getNeighbors(r, c);

        // Remove nearby vehicles
        traffic.removeVehiclesNear(r, c, neighbors);

        // Update graph
        travelGraph.unregisterTravelIntersection(r, c, neighbors);

        // Prevents error where vehicle could otherwise travel to TravelGraph
        // nodes that no longer exist.
        traffic.rerandomizeAllVehiclePaths(travelGraph);

        // Try to remove tile
        const tileRemoved = roadTileMatrix.removeTile(r, c);
        if (!tileRemoved) {
            return;
        }

        rerender();
    }

    /**
     * Force rerender of any changed Components.
     */
    function rerender() {
        const newRoadTileMatrix = new RoadTileMatrix(
            props.rows,
            props.cols,
            roadTileMatrix.innerArray
        );
        setRoadTileMatrix(newRoadTileMatrix);

        const graph = travelGraph.graph;
        const nodes = travelGraph.nodes;
        const intersections = travelGraph.intersections;
        const newTravelGraph = new TravelGraph(graph, nodes, intersections);
        setTravelGraph(newTravelGraph);

        const newTraffic = new Traffic(traffic.vehicles, traffic.inscts);
        setTraffic(newTraffic);
    }

    return (
        <div>
            <Grid
                globalSettings={props.globalSettings}
                roadTileMatrix={roadTileMatrix}
                addRoad={addRoad}
                removeRoad={removeRoad} />
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