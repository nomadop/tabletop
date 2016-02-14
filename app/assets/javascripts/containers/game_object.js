import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GameObject from '../components/game_object';
import {
  selectGameObject,
  unselectGameObjects,
  flipGameObject,
  rotateGameObject,
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

  render() {
    const { gameObjects, selectedIds } = this.props;

    return (
      <div className="game-object-container">
        { gameObjects.map(object => (
          <GameObject
            key={object.id}
            gameObject={object}
            isSelected={selectedIds.indexOf(object.id) >= 0}
            onSelect={this.props.selectGameObject.bind(null, object.id)}
            onRelease={this.props.unselectGameObjects.bind(null, [object.id])}
            onFlip={this.handleFlipGameObject.bind(this, object.id)}
            onRotate={this.handleRotateGameObject.bind(this, object.id)}
            releaseAll={this.props.unselectGameObjects.bind(null, selectedIds)}
          />
        )) }
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
  };
}

function dispatcher(dispatch) {
  return bindActionCreators({
    selectGameObject,
    unselectGameObjects,
    flipGameObject,
    rotateGameObject,
  }, dispatch);
}

export default connect(selector, dispatcher)(GameObjectContainer);
