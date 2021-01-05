import './Vehicle.css';

export class Vehicle {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }
}

export function VehicleComponent(props) {
    return (
        <div
            key={`vehicle${props.id}`}
            className="vehicle"
            style={{
                top: `${props.y}px`,
                left: `${props.x}px`,
            }} >
        </div >
    );
}