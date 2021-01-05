import PropTypes from 'prop-types';

export function GlobalSettingsForm(props) {

    const handleDisplayRoadTileDescriptorsChanged = (e) => {
        props.setDisplayRoadTileDescriptors(e.target.checked);
    }

    const handleDisplayTravelEdgesChanged = (e) => {
        props.setDisplayTravelEdges(e.target.checked);
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
                <label for="road-tile-descriptors">Tile Descriptors</label>
                <br />
                <input
                    type="checkbox"
                    id="travel-edges"
                    name="travel-edges"
                    onChange={handleDisplayTravelEdgesChanged}
                >
                </input>
                <label for="travel-edges">Travel Edges</label>
            </form>
        </div>
    );
}

GlobalSettingsForm.propTypes = {
    setDisplayTravelEdges: PropTypes.func.isRequired,
}