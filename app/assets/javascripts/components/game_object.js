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

  get className() {
    const classNames = ['game-object'];
    if (this.props.isSelected) {
      classNames.push('selected');
    }

    return classNames.join(' ');
  }

  handleClick(event) {
    const funcKey = event.ctrlKey || event.metaKey;
    const { isSelected, onSelect, onRelease, releaseAll } = this.props;
    if (isSelected) {
      if (funcKey) {
        onRelease();
      }
    } else {
      if (!funcKey) {
        releaseAll()
      }

      onSelect();
    }
  }

  render() {
    return (
      <div
        className={this.className}
        style={this.style}
        onClick={this.handleClick.bind(this)}
      ></div>
    );
  }
}

GameObject.propTypes = {
  gameObject: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onRelease: PropTypes.func,
  releaseAll: PropTypes.func,
};
