import PropTypes from 'prop-types';

import { Intersection } from '../Intersection/Intersection';
import { Vehicle, VehicleComponent } from '../Vehicle/Vehicle';

/**
 * Handles movement of all vehicles and intersection logic.
 */
export class Traffic {
    static count = 0;

    constructor(vehicles, inscts) {
        this.vehicles = vehicles;
        this.inscts = inscts ? inscts : {}; // intersections
        this._addVehicleToInsct = this._addVehicleToInsct.bind(this);
    }

    /**
     * Add Vehicle at TravelNode location.
     * @param {TravelNode} travelNode
     */
    addVehicle(travelNode) {
        const id = Traffic.count++;
        const x = travelNode.x;
        const y = travelNode.y;
        const vehicle = new Vehicle(id, x, y, travelNode.id);
        this.vehicles.push(vehicle);
        return vehicle;
    };

    /**
     * Returns whether Vehicle is colliding with another vehicle.
     * @param {Vehicle} vehicle
     * @returns Vehicle is colliding with another vehicle
     */
    _vehicleInCollision(vehicle) {
        for (const i in this.vehicles) {
            if (this.vehicles[i] !== vehicle) {
                if (vehicle.frontCollider.collidesWith(this.vehicles[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Add vehicle to intersection.
     * @param {Vehicle} vehicle Vehicle that has entered TravelNode of insct
     * @param {TravelNode} travelNode TravelNode associated with insct
     */
    _addVehicleToInsct(vehicle, travelNode) {
        const r = travelNode.row;
        const c = travelNode.col;
        const insctKey = `${r},${c}`;

        if (!this.inscts.hasOwnProperty(insctKey)) {
            this.inscts[insctKey] = new Intersection();
        }
        this.inscts[insctKey].enqueue(vehicle, travelNode.direction);
        vehicle.waitingAtInsct = true;
    }

    /**
     * Step all Vehicles.
     * @param {number} tickMillisec
     * @param {TravelGraph} travelGraph
     */
    step(tickMillisec, travelGraph, roadTileMatrix) {
        // Step intersections
        for (let insctKey in this.inscts) {
            const insct = this.inscts[insctKey];
            const dequeuedVehicle = insct.step(tickMillisec);
            if (dequeuedVehicle) {
                dequeuedVehicle.waitingAtInsct = false;
            }
        }

        // Step vehicles
        this.vehicles.forEach(vehicle => {
            if (!this._vehicleInCollision(vehicle)) {
                vehicle.step(
                    tickMillisec,
                    travelGraph,
                    roadTileMatrix,
                    this._addVehicleToInsct
                );
            }
        });
    }

    /**
     * Vehicle exists at given RoadTile.
     * @param {Vehicle} vehicle
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    vehicleIn(vehicle, r, c) {
        // Pull variables from .css
        const style = getComputedStyle(document.documentElement);
        const tileWidth = Number(style.getPropertyValue('--tile-width-raw'));
        const tileHeight = Number(style.getPropertyValue('--tile-height-raw'));

        const x1 = tileWidth * c;
        const y1 = tileHeight * r;
        const x2 = x1 + tileWidth - 1;
        const y2 = y1 + tileHeight - 1;

        return (vehicle.centerX >= x1 && vehicle.centerX <= x2
            && vehicle.centerY >= y1 && vehicle.centerY <= y2);
    }

    /**
     * Removes Vehicles from RoadTile at given coordinate and all neighbors.
     * @param {number} row
     * @param {number} col
     * @param {Object} neighbors
     */
    removeVehiclesNear(r, c, neighbors) {
        this.removeVehiclesAt(r, c);
        for (const direction in neighbors) {
            const [nR, nC] = neighbors[direction].coords;
            this.removeVehiclesAt(nR, nC);
        }
    }

    /**
     * Removes Vehicles from RoadTile at given coordinate.
     * @param {number} row
     * @param {number} col
     */
    removeVehiclesAt(r, c) {
        this.vehicles = this.vehicles.filter(vehicle =>
            !this.vehicleIn(vehicle, r, c)
        );
    }

    /**
     * Randomize path of all Vehicles using current TravelGraph state.
     * @param {TravelGraph} travelGraph
     */
    rerandomizeAllVehiclePaths(travelGraph) {
        this.vehicles.forEach(vehicle => {
            vehicle.resetRandomPath(travelGraph);
        });
    }
}

export function TrafficComponent(props) {
    return (
        <div>
            {props.traffic.vehicles.map(vehicle =>
                <VehicleComponent
                    key={`vehicle-component${vehicle.id}`}
                    globalSettings={props.globalSettings}
                    vehicle={vehicle} />
            )}
        </div>
    );
}

TrafficComponent.propTypes = {
    globalSettings: PropTypes.object.isRequired,
    traffic: PropTypes.object.isRequired,
}
