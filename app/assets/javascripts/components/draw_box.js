import React, { Component, PropTypes } from 'react';

export default class DrawBox extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    };
  }

  render() {
    return (
      <div className="draw-box" style={this.state}></div>
    );
  }
}
