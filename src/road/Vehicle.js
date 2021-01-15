import PropTypes from 'prop-types';

import './Vehicle.css';
import { Rectangle, RectangleCollider, RectangleComponent } from '../collision/Rectangle';
import { getRandomInt } from '../common/common';

export class Vehicle extends Rectangle {
    constructor(id, x, y, startNodeId) {
        super(x, y, 8, 4, 0, 0, 0);

        this.id = id;
        this.color = this.randomColor();
        this.path = [];
        this.prevTargetId = startNodeId;
        this.speedPerSec = 30;

        const xOffset = 6;
        const yOffset = 0;
        this.frontCollider = new RectangleCollider(x, y, 4, 2, this.angleRad, xOffset, yOffset);
    }

    randomColor() {
        const h = getRandomInt(0, 359);
        return `hsl(${h}, 100%, 75%)`;
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
        const x1 = this.centerX;
        const y1 = this.centerY;
        const x2 = targetNode.x;
        const y2 = targetNode.y;
        const dx = x2 - x1;
        const dy = y2 - y1;;

        const distToNode = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        const speedPerSec = Math.min(remainingSpeed, distToNode);
        const angleRad = Math.atan2(dy, dx);
        const xVelocity = speedPerSec * Math.cos(angleRad);
        const yVelocity = speedPerSec * Math.sin(angleRad);

        this.translate(xVelocity, yVelocity);
        this.rotateToAngleRad(angleRad);

        this.frontCollider.translate(xVelocity, yVelocity);
        this.frontCollider.rotateToAngleRad(this.angleRad);

        return remainingSpeed - speedPerSec;
    }

    step(tickMillisec, travelGraph) {
        // No where else to go
        if (this.path.length === 0) {
            this.setRandomPath(travelGraph);
        }

        let targetNode = travelGraph.getNode(this.path[0])
        let remainingSpeed = this.speedPerSec * (tickMillisec / 1000);

        while (remainingSpeed > 0) {
            remainingSpeed = this._moveTowardsTarget(remainingSpeed, targetNode);

            if (this.centerX === targetNode.x && this.centerY === targetNode.y) {
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
        <div>
            <RectangleComponent
                rect={props.vehicle}
                backgroundColor={props.vehicle.color}>
            </RectangleComponent>
            {props.globalSettings.displayVehicleColliders ?
                <RectangleComponent
                    rect={props.vehicle.frontCollider}
                    backgroundColor='#f00'>
                </RectangleComponent>
                : <div></div>
            }
        </div >
    );
}

VehicleComponent.propTypes = {
    globalSettings: PropTypes.object.isRequired,
    vehicle: PropTypes.object.isRequired,
}