import React from 'react'
import PropTypes from 'prop-types';

import { RoadTileMatrix, Grid } from './Grid';
import { TravelGraph } from './TravelGraph';

export class RoadNetwork extends React.Component {
    constructor(props) {
        super(props);

        const rows = this.props.rows;
        const cols = this.props.cols;

        this.state = {
            roadTileMatrix: new RoadTileMatrix(rows, cols, null)
        };

        this.addTile = this.addTile.bind(this);
    }

    addTile(r, c) {
        if (!this.state.roadTileMatrix.addTile(r, c, true)) {
            return;
        }

        const rows = this.props.rows;
        const cols = this.props.cols;
        const innerArray = this.state.roadTileMatrix.innerArray;

        // Force any re-renders from changed RoadTileMatrix
        const newRoadTileMatrix = new RoadTileMatrix(rows, cols, innerArray);
        this.setState({
            roadTileMatrix: newRoadTileMatrix,
        });
    }

    render() {
        return (
            <div>
                <Grid roadTileMatrix={this.state.roadTileMatrix} addTile={this.addTile} />
                <TravelGraph />
            </div>
        );
    };
}

RoadNetwork.propTypes = {
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
}