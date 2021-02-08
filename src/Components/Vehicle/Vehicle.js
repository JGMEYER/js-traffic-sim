import PropTypes from 'prop-types';

import './Vehicle.css';
import { Rectangle, RectangleCollider, RectangleComponent } from '../../util/collision/Rectangle';
import { roadTileTypeIsIntersection } from '../RoadTile/RoadTile';
import { TravelNodeType } from '../TravelGraph/TravelGraph';
import { getRandomInt } from '../../util/Random';

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

        // Can be modified externally
        this.waitingAtInsct = false;
    }

    randomColor() {
        const h = getRandomInt(0, 359);
        return `hsl(${h}, 100%, 75%)`;
    }

    setPath(path) {
        this.path = path;
    }

    setRandomPath(travelGraph) {
        const randPath = this._getRandomPath(travelGraph, this.prevTargetId);
        this.setPath(randPath);
    }

    resetRandomPath(travelGraph) {
        if (travelGraph.hasNode(this.path[0])) {
            // Continue routing to current target, then set new objective
            const randPath = this._getRandomPath(travelGraph, this.path[0]);
            this.setPath(randPath);
        } else {
            // Current target no longer exists, reroute based on prev target
            const randPath = this._getRandomPath(travelGraph, this.prevTargetId);
            this.prevTargetId = randPath.shift();
            this.setPath(randPath);
        }
    }

    _getRandomPath(travelGraph, startNodeId) {
        const randTarget = travelGraph.getRandomNodeAlongPath(startNodeId);
        return travelGraph.getShortestPath(startNodeId, randTarget.id);
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
        this.frontCollider.rotateToAngleRad(angleRad);

        this.angleRad = angleRad;

        return remainingSpeed - speedPerSec;
    }

    /**
     * Move vehicle along path.
     * @param {number} tickMillisec
     * @param {TravelGraph} travelGraph
     * @param {RoadTileMatrix} roadTileMatrix
     * @param {function} addVehicleToInsct
     */
    step(tickMillisec, travelGraph, roadTileMatrix, addVehicleToInsct) {
        // No where else to go
        if (this.path.length === 0) {
            this.setRandomPath(travelGraph);
        }

        let targetNode = travelGraph.getNode(this.path[0])
        let remainingSpeed = this.speedPerSec * (tickMillisec / 1000);

        while (!this.waitingAtInsct && remainingSpeed > 0) {
            // Prevent glitch where a vehicle will rotate unusually after
            // approaching its target node and starting a new path.
            if (this.prevTargetId !== targetNode.id) {
                // Move vehicle towards target
                remainingSpeed = this._moveTowardsTarget(remainingSpeed, targetNode);
            }

            if (this.centerX === targetNode.x && this.centerY === targetNode.y) {
                this.prevTargetId = parseInt(this.path.shift());

                // Repopulate path if exhausted
                if (this.path.length === 0) {
                    this.setRandomPath(travelGraph);
                }

                const prevTarget = travelGraph.getNode(this.prevTargetId);
                if (this._atInsct(roadTileMatrix, prevTarget)) {
                    addVehicleToInsct(this, prevTarget);
                    break;
                }

                targetNode = travelGraph.getNode(this.path[0]);
            }
        }
    }

    /**
     * Checks whether a given node is within an Intersection.
     * @param {RoadTileMatrix} roadTileMatrix
     * @param {TravelNode} travelNode Travel node that may or may not be at insct
     */
    _atInsct(roadTileMatrix, travelNode) {
        const roadTile = roadTileMatrix.get(travelNode.row, travelNode.col);
        return roadTileTypeIsIntersection(roadTile)
            && travelNode.travelNodeType === TravelNodeType.ENTER;
    }
}

export function VehicleComponent(props) {
    return (
        <div onClick={(e) => console.log(props.vehicle)} >
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