import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GameObject from '../components/game_object';
import {
  selectGameObject,
  unselectGameObjects,
  flipGameObjects,
  rotateGameObjects,
  dragGameObjects,
  dropGameObjects,
  receiveGameObjects,
  receiveDecks,
  removeGameObjects,
} from '../actions/game';
import { rotateByPoint } from '../utils/coordination_transformer';

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
      case 'update_deck':
        return this.props.receiveDecks([data.deck]);
      case 'remove_game_objects':
        return this.props.removeGameObjects(data.object_ids);
      case 'error':
        alert(JSON.stringify(data.error));
        return;
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

  handleFlipGameObjects() {
    const { selectedIds, selectedObjects } = this.props;
    const isFlipped = !selectedObjects.some(object => object.is_fliped);
    this.props.flipGameObjects(selectedIds, isFlipped);
    const updates = selectedIds.map(id => {
      return {id, is_fliped: isFlipped};
    });
    App.game.update_game_objects(updates);
  }

  handleRotateGameObjects(rotate) {
    const { selectedObjects, isDragging } = this.props;
    if (!isDragging) {
      const middleX = selectedObjects.reduce((result, object) => result + object.center_x, 0) / selectedObjects.length;
      const middleY = selectedObjects.reduce((result, object) => result + object.center_y, 0) / selectedObjects.length;
      const updates = selectedObjects.map(object => {
        const rotatedPosition = rotateByPoint([object.center_x, object.center_y], [middleX, middleY], rotate);
        return {
          id: object.id,
          rotate: object.rotate + rotate,
          center_x: rotatedPosition[0],
          center_y: rotatedPosition[1],
        };
      });
      this.props.rotateGameObjects(updates);
      App.game.update_game_objects(updates);
    }
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
    if (this.joiningDeck) {
      this.joiningDeck = false;
    } else {
      App.game.update_game_objects(objects);
    }

    window.removeEventListener('mousemove', this.dragHandler);
    window.removeEventListener('mouseup', this.dropHandler);
  }

  handleJoinDeck(deck) {
    const { selectedIds, selectedObjects, isDragging } = this.props;
    if (!isDragging || selectedIds.length < 1) {
      return;
    }

    const typeUnmatch = selectedObjects.some(object => object.meta_type !== 'GameObjectMetum');
    const subTypeUnmatch = selectedObjects.some(object => object.meta.sub_type !== deck.sub_type);
    if (typeUnmatch || subTypeUnmatch) {
      console.log('Type Error', typeUnmatch, subTypeUnmatch);
      console.log(selectedObjects.map(object => object.meta.sub_type), deck.sub_type);
      return false;
    }

    this.joiningDeck = true;
    App.game.join_deck(deck.id, selectedIds);
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
    case 80:
      return this.handleCreateDeck();
    case 70:
      return this.handleFlipGameObjects();
    case 82:
      return this.handleRotateGameObjects(45);
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
      onDragStart={this.handleDragStart.bind(this)}
      releaseAll={this.props.unselectGameObjects.bind(null, selectedIds)}
      joinDeck={this.handleJoinDeck.bind(this)}
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
  selectedObjects: PropTypes.array,
  selectGameObject: PropTypes.func,
  unselectGameObjects: PropTypes.func,
  flipGameObjects: PropTypes.func,
  rotateGameObjects: PropTypes.func,
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
  const selectedObjects = selectedIds.map(id => gameObjectById[id]);
  return {
    gameObjects,
    selectedIds,
    selectedObjects,
    isDragging: state.gameObjects.isDragging,
  };
}

function dispatcher(dispatch) {
  return bindActionCreators({
    selectGameObject,
    unselectGameObjects,
    flipGameObjects,
    rotateGameObjects,
    dragGameObjects,
    dropGameObjects,
    receiveGameObjects,
    receiveDecks,
    removeGameObjects,
  }, dispatch);
}

export default connect(selector, dispatcher)(GameObjectContainer);
