import React, { Component, PropTypes } from 'react';
import CoordinationLayer from './coordination_layer';

export default class DirectorLayer extends Component {
  get style() {
    const { width, height, camera } = this.props;
    const { centerX, centerY, scale, rotate } = camera;
    const offsetX = width / 2 - centerX;
    const offsetY = height / 2 - centerY;
    const transform = `rotate(${rotate}deg) scale(${scale}, ${scale}) translate(${offsetX}px, ${offsetY}px)`;

    return {
      width,
      height,
      transform,
    };
  }

  render() {
    return (
      <div className="director-layer" style={this.style}>
        <CoordinationLayer rows={10} cols={10} size={100} />
      </div>
    );
  }
}

DirectorLayer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  camera: PropTypes.object,
};
