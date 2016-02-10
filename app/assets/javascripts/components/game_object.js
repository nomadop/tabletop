import React, { Component, PropTypes } from 'react';

export default class GameObject extends Component {
  get style() {
    const { meta, center_x, center_y, rotate, is_fliped } = this.props.gameObject;
    const { height, width, front_img, back_img } = meta;
    const left = center_x - width / 2;
    const top = center_y - height / 2;

    const img = is_fliped ? back_img : front_img;
    const backgroundImage = `url(/res/poker/${img})`;
    const transform = `rotate(${rotate}deg)`;

    return {
      width,
      height,
      left,
      top,
      transform,
      backgroundImage,
    };
  }

  render() {
    return (
      <div className="game-object" style={this.style}>
      </div>
    );
  }
}

GameObject.propTypes = {
  gameObject: PropTypes.object,
};
