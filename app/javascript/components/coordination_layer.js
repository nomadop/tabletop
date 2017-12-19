import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CoordinationUnit from './coordination_unit';

export default class CoordinationLayer extends Component {
  renderUnits() {
    const { rows, cols, size } = this.props;
    const units = [];
    for (let row = -rows; row < rows; row++) {
      for (let col = -cols; col < cols; col++) {
        const key = `${row}, ${col}`;
        units.push(<CoordinationUnit row={row} col={col} size={size} key={key}/>);
      }
    }

    return units;
  }

  render() {
    return (
      <div className="coordination-layer" style={this.style}>
        {this.renderUnits()}
      </div>
    );
  }
}

CoordinationLayer.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number,
  size: PropTypes.number,
};
