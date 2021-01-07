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

    step(nodes) {
        this.vehicles.forEach(vehicle => vehicle.step(nodes));
    }
}

export function TrafficComponent(props) {
    return (
        <div>
            {props.traffic.vehicles.map(vehicle =>
                <VehicleComponent
                    key={`vehicle-component${vehicle.id}`}
                    id={vehicle.id}
                    x={vehicle.x}
                    y={vehicle.y}
                    color={vehicle.color} />
            )}
        </div>
    );
}

TrafficComponent.propTypes = {
    traffic: PropTypes.object.isRequired,
}
