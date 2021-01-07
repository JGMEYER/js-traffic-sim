import PropTypes from 'prop-types';

import './Vehicle.css';
import { getRandomInt } from '../common/common';

export class Vehicle {
    constructor(id, x, y, startNodeId) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = this.randomColor();
        this.path = [];
        this.prevTargetId = startNodeId;
    }

    randomColor() {
        const r = getRandomInt(100, 255);
        const g = getRandomInt(100, 255);
        const b = getRandomInt(100, 255);
        return `rgb(${r}, ${g}, ${b})`;
    };

    getPath(path) {
        return this.path;
    }

    setPath(path) {
        this.path = path;
    }

    _getRandomPath(travelGraph) {
        const randTarget = travelGraph.getRandomNode();
        return travelGraph.getShortestPath(this.prevTargetId, randTarget.id);
    }

    step(travelGraph) {
        if (this.path.length === 0) {
            const randPath = this._getRandomPath(travelGraph);
            this.setPath(randPath);
        }

        const targetId = this.path.shift();
        const targetNode = travelGraph.getNode(targetId);

        this.prevTargetId = parseInt(targetId);
        this.x = targetNode.x;
        this.y = targetNode.y;
    }
}

export function VehicleComponent(props) {
    return (
        <div
            className="vehicle"
            style={{
                top: `${props.y}px`,
                left: `${props.x}px`,
                backgroundColor: `${props.color}`,
            }} >
        </div >
    );
}

VehicleComponent.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
}