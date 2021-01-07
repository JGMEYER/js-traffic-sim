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
        this.speed = 5;
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

    setRandomPath(travelGraph) {
        const randPath = this._getRandomPath(travelGraph);
        this.setPath(randPath);
    }

    _getRandomPath(travelGraph) {
        const randTarget = travelGraph.getRandomNode();
        return travelGraph.getShortestPath(this.prevTargetId, randTarget.id);
    }

    _moveTowardsTarget(remainingSpeed, targetNode) {
        const x1 = this.x;
        const y1 = this.y;
        const x2 = targetNode.x;
        const y2 = targetNode.y;
        const dx = x2 - x1;
        const dy = y2 - y1;;

        const distToNode = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        const speed = Math.min(this.speed, distToNode);
        const angle = Math.atan2(dy, dx);
        const xVelocity = speed * Math.cos(angle);
        const yVelocity = speed * Math.sin(angle);

        this.x += Math.floor(xVelocity);
        this.y += Math.floor(yVelocity);

        return remainingSpeed - speed;
    }

    step(travelGraph) {
        // No where else to go
        if (this.path.length === 0) {
            this.setRandomPath(travelGraph);
        }

        let targetNode = travelGraph.getNode(this.path[0])
        let remainingSpeed = this.speed;

        while (remainingSpeed > 0) {
            remainingSpeed = this._moveTowardsTarget(remainingSpeed, targetNode);

            if (this.x === targetNode.x && this.y === targetNode.y) {
                this.prevTargetId = parseInt(this.path.shift());
                // Repopulate path if exhausted
                if (this.path.length === 0) {
                    this.setRandomPath(travelGraph);
                }
                targetNode = travelGraph.getNode(this.path[0]);
            }
        }
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