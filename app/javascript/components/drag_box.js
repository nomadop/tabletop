import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class DragBox extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      rotate: 0,
    };
  }

  get style() {
    const { top, left, width, height, rotate } = this.state;
    const transform = `rotate(${rotate}deg)`;
    const borderWidth = width > 0 && height > 0 ? 1 : 0;
    return {
      top,
      left,
      width,
      height,
      transform,
      borderWidth,
    };
  }

  render() {
    return (
      <div className="drag-box" style={this.style}></div>
    );
  }
}
