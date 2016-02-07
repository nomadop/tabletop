import React, { Component, PropTypes } from 'react';
import DirectorLayer from './director_layer';

export default class PerspectiveLayer extends Component {
  get transform() {
    const { angle, height } = this.props.camera;
    return `perspective(${height}px) rotateX(${angle}deg)`;
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
        <DirectorLayer {...this.props} />
      </div>
    );
  }
}

PerspectiveLayer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  camera: PropTypes.object,
};
