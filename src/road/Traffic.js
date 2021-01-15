import PropTypes from 'prop-types';

import { Vehicle, VehicleComponent } from './Vehicle';

export class Traffic {
    static count = 0;

    constructor(vehicles) {
        this.vehicles = vehicles;
    }

    addVehicle(travelNode) {
        const id = Traffic.count++;
        const x = travelNode.x;
        const y = travelNode.y;
        const vehicle = new Vehicle(id, x, y, travelNode.id);
        this.vehicles.push(vehicle);
        return vehicle;
    };

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

    step(tickMillisec, travelGraph) {
        this.vehicles.forEach(vehicle => {
            if (!this._vehicleInCollision(vehicle)) {
                vehicle.step(tickMillisec, travelGraph)
            }
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
