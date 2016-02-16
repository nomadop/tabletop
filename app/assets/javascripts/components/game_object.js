import React, { Component, PropTypes } from 'react';

export default class GameObject extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  get style() {
    const { gameObject, isDragging } = this.props;
    const { meta, center_x, center_y, rotate, is_fliped } = gameObject;
    const { height, width, front_img, back_img } = meta;
    const centerX = isDragging && this.state.centerX ? this.state.centerX : center_x;
    const centerY = isDragging && this.state.centerY ? this.state.centerY : center_y;
    const left = centerX - width / 2;
    const top = centerY - height / 2;

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
    const { isSelected, isDragging, gameObject } = this.props;
    const classNames = ['game-object'];
    if (isSelected) {
      classNames.push('selected');
    }

    if (isDragging) {
      classNames.push('dragging');
    }

    if (gameObject.meta_type === 'Deck') {
      classNames.push('deck-object');
    }

    return classNames.join(' ');
  }

  handleMouseDown(event) {
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

  handleMouseMove(event) {
    const { isSelected, isDragging, onDragStart } = this.props;
    if (isSelected && !isDragging && event.buttons > 0) {
      onDragStart(event);
    }
  }

  handleKeyDown(event) {
    event.preventDefault();
    const { gameObject, onFlip, onRotate } = this.props;
    switch (event.keyCode) {
      case 70:
        return onFlip(!gameObject.is_fliped);
      case 82:
        return onRotate(gameObject.rotate + 45);
      default:
        return;
    }
  }

  renderNormalObject() {
    return (
      <div
        className={this.className}
        style={this.style}
        tabIndex="1"
        onKeyDown={this.handleKeyDown.bind(this)}
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
      ></div>
    );
  }

  renderDeckObject() {
    const { gameObject } = this.props;

    return (
      <div
        className={this.className}
        style={this.style}
        tabIndex="1"
        onKeyDown={this.handleKeyDown.bind(this)}
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
      >
        <span className="count unselectable">{gameObject.meta.count}</span>
      </div>
    );
  }

  render() {
    switch (this.props.gameObject.meta_type) {
    case 'Deck':
      return this.renderDeckObject();
    case 'GameObjectMetum':
    default:
      return this.renderNormalObject();
    }
  }
}

GameObject.propTypes = {
  gameObject: PropTypes.object,
  isSelected: PropTypes.bool,
  isDragging: PropTypes.bool,
  onSelect: PropTypes.func,
  onFlip: PropTypes.func,
  onRotate: PropTypes.func,
  onRelease: PropTypes.func,
  onDragStart: PropTypes.func,
  releaseAll: PropTypes.func,
};
