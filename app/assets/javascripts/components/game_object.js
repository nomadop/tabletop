import React, { Component, PropTypes } from 'react';

export default class GameObject extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  componentWillMount() {
    const innerObjects = this.props.gameObject.meta.innerObjects;
    if (innerObjects) {
      this.setState({expandIndex: Math.floor(innerObjects.length / 2)});
    }
  }

  get style() {
    const { gameObject } = this.props;
    const { meta, center_x, center_y, related_x, related_y, is_fliped, isDragging, container, container_type } = gameObject;
    const { height, width, front_img, back_img } = meta;
    let centerX;
    let centerY;
    let rotate;
    if (gameObject.container_id && gameObject.container_type !== 'Deck') {
      centerX = related_x;
      centerY = related_y;
      rotate = gameObject.related_rotate;
    } else {
      centerX = isDragging && this.state.centerX ? this.state.centerX : center_x;
      centerY = isDragging && this.state.centerY ? this.state.centerY : center_y;
      rotate = gameObject.rotate;
    }
    const left = centerX - width / 2;
    const top = centerY - height / 2;

    let img = is_fliped ? back_img : front_img;
    const otherArea = container && container_type === 'PlayerArea' && !container.isOwner;
    if (otherArea) {
      img = back_img;
    }
    const backgroundImage = img ? `url(${img.url})` : null;
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
    const { isSelected, isLocked, gameObject } = this.props;
    const classNames = ['game-object', 'undraggable'];
    if (isSelected) {
      classNames.push('selected');
    }

    if (isLocked) {
      classNames.push('locked');
    }

    if (gameObject.isDragging) {
      classNames.push('dragging');
    }

    if (gameObject.meta_type === 'Deck') {
      classNames.push('deck-object');

      if (!gameObject.meta.innerObjects.length) {
        classNames.push('empty');
      }
    }

    if (gameObject.meta_type === 'GameFlow') {
      classNames.push('flow-object');
    }

    if (gameObject.player_num) {
      classNames.push(`player${gameObject.player_num}`);
    }

    return classNames.join(' ');
  }

  handleMouseDown(event) {
    const funcKey = event.ctrlKey || event.metaKey;
    const { isSelected, onSelect, onRelease, isLocked, gameObject } = this.props;

    if (isSelected) {
      if (funcKey) {
        onRelease([gameObject.id]);
      }
    } else if (!isLocked) {
      if (!funcKey) {
        onRelease()
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
        const deck = gameObject.meta;
        if (deck.innerObjects.length) {
          const target = deck.is_expanded ? deck.innerObjects[this.state.expandIndex] : null;
          draw(target, event);
        }
      }
    }
  }

  handleExpandIndexMove(left) {
    console.log('index move', left);
    const offset = left ? -1 : 1;
    const expandIndex = this.state.expandIndex + offset;
    if (expandIndex < 0 || expandIndex >= this.props.gameObject.meta.innerObjects.length) {
      return;
    }

    this.setState({expandIndex});
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

  renderFlowObject(flow) {
    return (
      <div
        className={this.className}
        style={this.style}
        tabIndex="1"
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
      >
        <span className="flow-name">{flow.name}</span>
        {flow.flow_actions.map(action => <span className="flow-action">{action.name}</span>)}
      </div>
    );
  }

  renderInnerObjects(deck) {
    if (!deck.is_expanded) {
      return;
    }

    const nodes = [];
    const length = deck.innerObjects.length;
    const expandIndex = this.state.expandIndex;
    const offsetWidth = deck.width * 1.5 / length;
    for (let i = 0; i < length; i++) {
      const object = deck.innerObjects[i];
      const { width, height, front_img } = object.meta;
      const isTop = i === expandIndex;
      const left = (i - expandIndex) * offsetWidth;
      const style = {
        width: isTop ? width * 1.2 : width,
        height: isTop ? height * 1.2 : height,
        top: isTop ? height * -0.1 : 0,
        left: isTop ? left - width * 0.1 : left,
        zIndex: expandIndex - Math.abs(i - expandIndex),
        background: `url(${front_img.url}) round`,
      };
      const onClick = isTop ? () => {} : this.handleExpandIndexMove.bind(this, i < expandIndex);
      nodes.push(
        <div className="game-object inner-object"
             key={object.id}
             style={style}
             onClick={onClick}
        ></div>
      );
    }

    return nodes;
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
        <span className="count">{deck.innerObjects.length}</span>
        {this.renderInnerObjects(deck)}
      </div>
    );
  }

  render() {
    const { gameObject } = this.props;
    if (gameObject.meta_type === 'Deck' && gameObject.id !== 'fakeDragging') {
      return this.renderDeckObject();
    } else if (gameObject.meta_type === 'GameFlow') {
      return this.renderFlowObject(gameObject.meta);
    } else {
      return this.renderNormalObject();
    }
  }
}

GameObject.propTypes = {
  gameObject: PropTypes.object,
  isSelected: PropTypes.bool,
  isLocked: PropTypes.bool,
  onSelect: PropTypes.func,
  onRelease: PropTypes.func,
  onDragStart: PropTypes.func,
  joinDeck: PropTypes.func,
  draw: PropTypes.func,
};
