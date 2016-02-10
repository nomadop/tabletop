import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GameObject from '../components/game_object';

class GameObjectContainer extends Component {
  render() {
    return (
      <div className="game-object-container">
        { this.props.gameObjects.map(object => <GameObject key={object.id} gameObject={object}/>) }
      </div>
    );
  }
}

GameObjectContainer.propTypes = {
  gameObjects: PropTypes.array,
};

function selector(state) {
  const metaById = state.meta.byId;
  const gameObjects = Object.values(state.gameObjects.byId);
  gameObjects.forEach(object => {
    object.meta = metaById[object.meta_id];
  });
  return {
    gameObjects,
  };
}

function dispatcher(dispatch) {
  return bindActionCreators({
  }, dispatch);
}

export default connect(selector, dispatcher)(GameObjectContainer);
