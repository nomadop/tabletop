import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GameObject from '../components/game_object';
import {
  selectGameObject,
  unselectGameObjects,
  flipGameObject,
  rotateGameObject,
  dragGameObjects,
  dropGameObjects,
  receiveGameObjects,
  receiveDecks,
  removeGameObjects,
} from '../actions/game';

class GameObjectContainer extends Component {
  componentDidMount() {
    this.gameObjectReceivers = (data) => {
      switch (data.action) {
      case 'create_game_object':
      case 'update_game_object':
        return this.props.receiveGameObjects([data.object]);
      case 'update_game_objects':
        return this.props.receiveGameObjects(data.objects);
      case 'create_deck':
        this.props.receiveDecks([data.deck]);
        return this.props.receiveGameObjects([data.object]);
      case 'remove_game_objects':
        return this.props.removeGameObjects(data.object_ids);
      default:
        return;
      }
    };

    App.game.register_receiver(this.gameObjectReceivers);
    this.dragHandler = this.handleDragGameObjects.bind(this);
    this.dropHandler = this.handleDropGameObjects.bind(this);
  }

  componentWillUnmount() {
    App.game.unregister_receiver(this.gameObjectReceivers);
  }

  handleFlipGameObject(id, isFlipped) {
    this.props.flipGameObject(id, isFlipped);
    App.game.update_game_object(id, {is_fliped: isFlipped});
  }

  handleRotateGameObject(id, rotate) {
    this.props.rotateGameObject(id, rotate);
    App.game.update_game_object(id, {rotate: rotate});
  }

  handleCreateDeck() {
    const { selectedIds } = this.props;
    App.game.create_deck(selectedIds);
  }

  handleDragStart(event) {
    const mouseInfo = this.props.extractMouseEvent(event);
    const { selectedIds } = this.props;

    this.props.dragGameObjects(selectedIds);
    this.draggingComponents = selectedIds.map(id => this.refs[`gameObject${id}`]);
    this.draggingComponents.forEach(component => {
      const gameObject = component.props.gameObject;
      component.multipleDragOffsetX = gameObject.center_x - mouseInfo.x.original;
      component.multipleDragOffsetY = gameObject.center_y - mouseInfo.y.original;
    });

    window.addEventListener('mousemove', this.dragHandler);
    window.addEventListener('mouseup', this.dropHandler);
  }

  handleDragGameObjects(event) {
    const mouseInfo = this.props.extractMouseEvent(event);
    this.draggingComponents.forEach(component => {
      component.setState({
        centerX: mouseInfo.x.original + component.multipleDragOffsetX,
        centerY: mouseInfo.y.original + component.multipleDragOffsetY,
      });
    });
  }

  handleDropGameObjects() {
    const objects = this.draggingComponents.map(component => {
      const gameObject = component.props.gameObject;
      return {
        id: gameObject.id,
        lock_version: gameObject.lock_version,
        center_x: component.state.centerX,
        center_y: component.state.centerY,
      };
    });
    this.props.dropGameObjects(objects);
    App.game.update_game_objects(objects);
    window.removeEventListener('mousemove', this.dragHandler);
    window.removeEventListener('mouseup', this.dropHandler);
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
    case 80:
      return this.handleCreateDeck();
    default:
      return;
    }
  }

  renderGameObject(object, selectedIds, isDragging) {
    const id = object.id;
    const isSelected = selectedIds.indexOf(id) >= 0;
    return <GameObject
      key={id}
      ref={`gameObject${id}`}
      gameObject={object}
      isSelected={isSelected}
      isDragging={isSelected && isDragging}
      onSelect={this.props.selectGameObject.bind(null, id)}
      onRelease={this.props.unselectGameObjects.bind(null, [id])}
      onFlip={this.handleFlipGameObject.bind(this, id)}
      onRotate={this.handleRotateGameObject.bind(this, id)}
      onDragStart={this.handleDragStart.bind(this)}
      releaseAll={this.props.unselectGameObjects.bind(null, selectedIds)}
      extractMouseEvent={this.props.extractMouseEvent}
    />
  }

  render() {
    const { gameObjects, selectedIds, isDragging } = this.props;

    return (
      <div className="game-object-container" onKeyDown={this.handleKeyDown.bind(this)}>
        { gameObjects.map(object => this.renderGameObject(object, selectedIds, isDragging)) }
      </div>
    );
  }
}

GameObjectContainer.propTypes = {
  gameObjects: PropTypes.array,
  selectedIds: PropTypes.array,
  selectGameObject: PropTypes.func,
  unselectGameObjects: PropTypes.func,
  flipGameObject: PropTypes.func,
  rotateGameObject: PropTypes.func,
  isDragging: PropTypes.bool,
  dragGameObjects: PropTypes.func,
  dropGameObjects: PropTypes.func,
  receiveGameObjects: PropTypes.func,
  receiveDecks: PropTypes.func,
  removeGameObjects: PropTypes.func,
};

function selector(state) {
  const metaById = state.meta.byId;
  const deckById = state.decks.byId;
  const gameObjectById = state.gameObjects.byId;
  const gameObjects = state.gameObjects.ids.map(id => {
    const object = gameObjectById[id];
    if (object.meta_type === 'Deck') {
      object.meta = deckById[object.meta_id];
    } else {
      object.meta = metaById[object.meta_id];
    }
    return object;
  });
  const selectedIds = state.gameObjects.selectedIds;
  return {
    gameObjects,
    selectedIds,
    isDragging: state.gameObjects.isDragging,
  };
}

function dispatcher(dispatch) {
  return bindActionCreators({
    selectGameObject,
    unselectGameObjects,
    flipGameObject,
    rotateGameObject,
    dragGameObjects,
    dropGameObjects,
    receiveGameObjects,
    receiveDecks,
    removeGameObjects,
  }, dispatch);
}

export default connect(selector, dispatcher)(GameObjectContainer);
