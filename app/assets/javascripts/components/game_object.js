import React, { Component, PropTypes } from 'react';

export default class GameObject extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
    this.dragHandler = this.handleDragging.bind(this);
    this.dropHandler = this.handleDrop.bind(this);
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
    const { isSelected, isDragging } = this.props;
    const classNames = ['game-object'];
    if (isSelected) {
      classNames.push('selected');
    }

    if (isDragging) {
      classNames.push('dragging');
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
    const { isSelected, isDragging, onDrag } = this.props;
    if (isSelected && !isDragging && event.buttons > 0) {
      onDrag();
      window.addEventListener('mousemove', this.dragHandler);
      window.addEventListener('mouseup', this.dropHandler);
    }
  }

  handleDragging(event) {
    const mouseInfo = this.props.extractMouseEvent(event);
    this.setState({
      centerX: mouseInfo.x.original,
      centerY: mouseInfo.y.original,
    });
  }

  handleDrop() {
    const { centerX, centerY } = this.state;
    this.props.onDrop(centerX, centerY);
    window.removeEventListener('mousemove', this.dragHandler);
    window.removeEventListener('mouseup', this.dropHandler);
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

  render() {
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
}

GameObject.propTypes = {
  gameObject: PropTypes.object,
  isSelected: PropTypes.bool,
  isDragging: PropTypes.bool,
  onSelect: PropTypes.func,
  onFlip: PropTypes.func,
  onRotate: PropTypes.func,
  onRelease: PropTypes.func,
  onDrag: PropTypes.func,
  onDrop: PropTypes.func,
  releaseAll: PropTypes.func,
  extractMouseEvent: PropTypes.func,
};
