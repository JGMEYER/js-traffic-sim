import PropTypes from 'prop-types';

import { Vehicle, VehicleComponent } from './Vehicle';

export class Traffic {
    constructor(vehicles) {
        this.vehicles = vehicles;
    }

    addVehicle(travelNode) {
        const id = Traffic.count++;
        const x = travelNode.x;
        const y = travelNode.y;
        this.vehicles.push(new Vehicle(id, x, y));
    };
}

export function TrafficComponent(props) {
    console.log(props.traffic.vehicles);
    return (
        <div>
            {props.traffic.vehicles.map(vehicle =>
                <VehicleComponent
                    id={vehicle.id}
                    x={vehicle.x}
                    y={vehicle.y} />
            )}
        </div>
    );
}

TrafficComponent.propTypes = {
    traffic: PropTypes.object.isRequired,
}
