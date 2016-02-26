import React, { Component, PropTypes } from 'react';

export default class GameObject extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  get style() {
    const { gameObject } = this.props;
    const { meta, center_x, center_y, rotate, is_fliped, isDragging } = gameObject;
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
    const { isSelected, gameObject } = this.props;
    const classNames = ['game-object', 'unselectable', 'undraggable'];
    if (isSelected) {
      classNames.push('selected');
    }

    if (gameObject.isDragging) {
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
    const { isSelected, onDragStart, gameObject } = this.props;
    if (isSelected && !gameObject.isDragging && event.buttons > 0) {
      onDragStart(event);
    }
  }

  handleDeckObjectMouseMove(event) {
    const { isSelected, onDragStart, gameObject, draw } = this.props;
    if (isSelected && event.buttons > 0) {
      if (!gameObject.isDragging && event.shiftKey) {
        onDragStart(event);
      } else {
        draw(null, event);
      }
    }
  }

  renderNormalObject() {
    return (
      <div
        className={this.className}
        style={this.style}
        tabIndex="1"
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
      ></div>
    );
  }

  renderDeckObject() {
    const { gameObject, joinDeck } = this.props;
    const deck = gameObject.meta;

    return (
      <div
        className={this.className}
        style={this.style}
        tabIndex="1"
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseMove={this.handleDeckObjectMouseMove.bind(this)}
        onMouseUp={joinDeck.bind(null, deck)}
      >
        <span className="count unselectable">{deck.innerObjects.length}</span>
      </div>
    );
  }

  render() {
    const { gameObject } = this.props;
    if (gameObject.meta_type === 'Deck' && gameObject.id !== 'fakeDragging') {
      return this.renderDeckObject();
    } else {
      return this.renderNormalObject();
    }
  }
}

GameObject.propTypes = {
  gameObject: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onRelease: PropTypes.func,
  onDragStart: PropTypes.func,
  releaseAll: PropTypes.func,
  joinDeck: PropTypes.func,
  draw: PropTypes.func,
};
