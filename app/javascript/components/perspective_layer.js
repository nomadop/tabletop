import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class PerspectiveLayer extends Component {
  get transform() {
    const { angle, perspective } = this.props.camera;
    return `perspective(${perspective}px) rotateX(${angle}deg)`;
  }

  get style() {
    const { width, height } = this.props;
    const transform = this.transform;

    return {
      width,
      height,
      transform,
    };
  }

  render() {
    return (
      <div className="perspective-layer" style={this.style}>
        {this.props.children}
      </div>
    );
  }
}

PerspectiveLayer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  camera: PropTypes.object,
};
