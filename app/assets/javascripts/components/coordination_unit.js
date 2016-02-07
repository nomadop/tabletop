import React, { Component, PropTypes } from 'react';

export default class CoordinationUnit extends Component {
  render() {
    const { row, col, size } = this.props;
    const top = (row - 1) * size;
    const left = (col - 1) * size;

    const style = {
      top,
      left,
      width: size,
      height: size,
    };

    return (
      <div className="coordination-unit" style={style}>
        {`${left}, ${top}`}
      </div>
    );
  }
}

CoordinationUnit.propTypes = {
  row: PropTypes.number,
  col: PropTypes.number,
  size: PropTypes.number,
};
