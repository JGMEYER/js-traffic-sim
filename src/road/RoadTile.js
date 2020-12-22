import './road.css';

export function RoadTile(props) {
    return (
        <div>
            <div className='road-tile-descriptor'>{props.type}</div>
            <div className={`road-tile road-tile${props.type}`}></div>
        </div>
    );
}