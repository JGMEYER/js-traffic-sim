import PropTypes from 'prop-types';

export function GlobalSettingsForm(props) {
    const handleDisplayTravelEdgesChanged = (e) => {
        props.setDisplayTravelEdges(e.target.checked);
    }

    return (
        <form>
            <input
                type="checkbox"
                id="display-travel-edges"
                name="display-travel-edges"
                onChange={handleDisplayTravelEdgesChanged}
            >
            </input>
            <label for="display-travel-edges">Display Travel Edges</label>
        </form>
    );
}

GlobalSettingsForm.propTypes = {
    setDisplayTravelEdges: PropTypes.func.isRequired,
}