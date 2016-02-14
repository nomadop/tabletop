import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GameObject from '../components/game_object';
import {
  selectGameObject,
  unselectGameObjects,
  flipGameObject,
  rotateGameObject,
  dragGameObject,
  dropGameObject,
} from '../actions/game';

class GameObjectContainer extends Component {
  handleFlipGameObject(id, isFlipped) {
    this.props.flipGameObject(id, isFlipped);
    App.game.update_game_object(id, {is_fliped: isFlipped});
  }

  handleRotateGameObject(id, rotate) {
    this.props.rotateGameObject(id, rotate);
    App.game.update_game_object(id, {rotate: rotate});
  }

  handleDropGameObject(id, centerX, centerY) {
    this.props.dropGameObject(id, centerX, centerY);
    App.game.update_game_object(id, {center_x: centerX, center_y: centerY});
  }

  renderGameObject(object, selectedIds, isDragging) {
    const id = object.id;
    const isSelected = selectedIds.indexOf(id) >= 0;
    return <GameObject
      key={id}
      gameObject={object}
      isSelected={isSelected}
      isDragging={isSelected && isDragging}
      onSelect={this.props.selectGameObject.bind(null, id)}
      onRelease={this.props.unselectGameObjects.bind(null, [id])}
      onFlip={this.handleFlipGameObject.bind(this, id)}
      onRotate={this.handleRotateGameObject.bind(this, id)}
      onDrag={this.props.dragGameObject.bind(null, id)}
      onDrop={this.handleDropGameObject.bind(this, id)}
      releaseAll={this.props.unselectGameObjects.bind(null, selectedIds)}
      extractMouseEvent={this.props.extractMouseEvent}
    />
  }

  render() {
    const { gameObjects, selectedIds, isDragging } = this.props;

    return (
      <div className="game-object-container">
        { gameObjects.map(object => this.renderGameObject(object, selectedIds, isDragging)) }
      </div>
    );
  }
}

GameObjectContainer.propTypes = {
  gameObjects: PropTypes.array,
  selectGameObject: PropTypes.func,
  unselectGameObjects: PropTypes.func,
  flipGameObject: PropTypes.func,
  rotateGameObject: PropTypes.func,
  isDragging: PropTypes.bool,
  dragGameObject: PropTypes.func,
  dropGameObject: PropTypes.func,
  extractMouseEvent: PropTypes.func,
};

function selector(state) {
  const metaById = state.meta.byId;
  const gameObjects = Object.values(state.gameObjects.byId);
  gameObjects.forEach(object => {
    object.meta = metaById[object.meta_id];
  });
  return {
    gameObjects,
    selectedIds: state.gameObjects.selectedIds,
    isDragging: state.gameObjects.isDragging,
  };
}

function dispatcher(dispatch) {
  return bindActionCreators({
    selectGameObject,
    unselectGameObjects,
    flipGameObject,
    rotateGameObject,
    dragGameObject,
    dropGameObject,
  }, dispatch);
}

export default connect(selector, dispatcher)(GameObjectContainer);
