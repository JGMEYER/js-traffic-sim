import PropTypes from 'prop-types';

export function GlobalSettingsForm(props) {

    const handleDisplayRoadTileDescriptorsChanged = (e) => {
        props.setDisplayRoadTileDescriptors(e.target.checked);
    }

    const handleDisplayTravelEdgesChanged = (e) => {
        props.setDisplayTravelEdges(e.target.checked);
    }

    const handleDisplayVehicleCollidersChanged = (e) => {
        props.setDisplayVehicleColliders(e.target.checked);
    }

    return (
        <div>
            <p>Debug Settings:</p>
            <form>
                <input
                    type="checkbox"
                    id="road-tile-descriptors"
                    name="road-tile-descriptors"
                    onChange={handleDisplayRoadTileDescriptorsChanged}
                >
                </input>
                <label htmlFor="road-tile-descriptors">Tile Descriptors</label>
                <br />
                <input
                    type="checkbox"
                    id="travel-edges"
                    name="travel-edges"
                    onChange={handleDisplayTravelEdgesChanged}
                >
                </input>
                <label htmlFor="travel-edges">Travel Edges</label>
                <br />
                <input
                    type="checkbox"
                    id="vehicle-colliders"
                    name="vehicle-colliders"
                    onChange={handleDisplayVehicleCollidersChanged}
                >
                </input>
                <label htmlFor="vehicle-colliders">Vehicle Colliders</label>
            </form>
        </div>
    );
}

GlobalSettingsForm.propTypes = {
    setDisplayRoadTileDescriptors: PropTypes.func.isRequired,
    setDisplayTravelEdges: PropTypes.func.isRequired,
    setDisplayVehicleColliders: PropTypes.func.isRequired,
}