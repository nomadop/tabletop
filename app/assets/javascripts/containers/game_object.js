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
} from '../actions/game';

class GameObjectContainer extends Component {
  componentDidMount() {
    this.createGameObjectHandler = (data) => {
      if (data.action === 'create_game_object') {
        this.props.receiveGameObjects([data.object]);
      }
    };

    this.updateGameObjectsHandler = (data) => {
      if (data.action === 'update_game_objects') {
        this.props.receiveGameObjects(data.objects);
      }
    };

    App.game.register_receiver(this.createGameObjectHandler);
    App.game.register_receiver(this.updateGameObjectsHandler);
    this.dragHandler = this.handleDragGameObjects.bind(this);
    this.dropHandler = this.handleDropGameObjects.bind(this);
  }

  componentWillUnmount() {
    App.game.unregister_receiver(this.createGameObjectHandler);
    App.game.unregister_receiver(this.updateGameObjectsHandler);
  }

  handleFlipGameObject(id, isFlipped) {
    this.props.flipGameObject(id, isFlipped);
    App.game.update_game_object(id, {is_fliped: isFlipped});
  }

  handleRotateGameObject(id, rotate) {
    this.props.rotateGameObject(id, rotate);
    App.game.update_game_object(id, {rotate: rotate});
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
      <div className="game-object-container">
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
};

function selector(state) {
  const metaById = state.meta.byId;
  const gameObjectById = state.gameObjects.byId;
  const gameObjects = Object.values(gameObjectById);
  gameObjects.forEach(object => {
    object.meta = metaById[object.meta_id];
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
  }, dispatch);
}

export default connect(selector, dispatcher)(GameObjectContainer);
