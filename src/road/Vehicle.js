import PropTypes from 'prop-types';

import './Vehicle.css';
import { getRandomInt } from '../common/common';

export class Vehicle {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = this.randomColor();
        this.path = [];
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

    step(nodes) {
        if (this.path.length <= 0) {
            return;
        }

        const targetId = this.path.shift();
        const targetNode = nodes[targetId];
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