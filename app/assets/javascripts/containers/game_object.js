import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GameObject from '../components/game_object';
import PlayerArea from '../components/player_area';
import {
  selectGameObject,
  unselectGameObjects,
  flipGameObjects,
  rotateGameObjects,
  dragGameObjects,
  dropGameObjects,
  receiveGameObjects,
  receiveDecks,
  receivePlayerAreas,
  removeGameObjects,
  startDrawingGameObject,
  endDrawingGameObject,
} from '../actions/game';
import { rotateByPoint } from '../utils/coordination_transformer';
import { serializeGameObject, unserializeGameObject } from '../serializers/game_object';
import { gameObjectContainerSelector} from '../selectors/game';

class GameObjectContainer extends Component {
  componentDidMount() {
    this.gameObjectReceivers = (data) => {
      switch (data.action) {
      case 'create_game_object':
      case 'update_game_object':
      case 'lock_failed':
        return this.props.receiveGameObjects([unserializeGameObject(data.object)]);
      case 'update_game_objects':
        const objects = data.objects.map(unserializeGameObject);
        return this.props.receiveGameObjects(objects);
      case 'create_deck':
        this.props.receiveDecks([data.deck]);
        return this.props.receiveGameObjects([unserializeGameObject(data.object)]);
      case 'create_player_area':
        return this.props.receivePlayerAreas([data.area]);
      case 'update_deck':
        return this.props.receiveDecks([data.deck]);
      case 'remove_game_objects':
        return this.props.removeGameObjects(data.object_ids);
      case 'draw_success':
        const fakeDraggingComponent = this.refs.gameObjectfakeDragging;
        const object = Object.assign(unserializeGameObject(data.object), {
          isDragging: true,
          center_x: fakeDraggingComponent.state.centerX || fakeDraggingComponent.props.gameObject.center_x,
          center_y: fakeDraggingComponent.state.centerY || fakeDraggingComponent.props.gameObject.center_y,
          multipleDragOffsetX: fakeDraggingComponent.multipleDragOffsetX,
          multipleDragOffsetY: fakeDraggingComponent.multipleDragOffsetY,
        });
        this.dragStarting = true;
        return this.props.endDrawingGameObject(object);
      case 'lock_game_object':
        return this.props.selectGameObject(data.player_num, data.object_id);
      case 'release_game_objects':
        return this.props.unselectGameObjects(data.object_ids);
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
    this.draggingComponents = [];
    window.addEventListener('mousemove', this.dragHandler);
    window.addEventListener('mouseup', this.dropHandler);
  }

  componentWillUnmount() {
    App.game.unregister_receiver(this.gameObjectReceivers);
    window.removeEventListener('mousemove', this.dragHandler);
    window.removeEventListener('mouseup', this.dropHandler);
  }

  componentDidUpdate() {
    const { selectedObjects } = this.props;


    if (this.dragStarting) {
      this.dragStarting = false;
      this.draggingComponents = [];
      selectedObjects.forEach(object => {
        if (object.isDragging) {
          this.draggingComponents.push(this.refs[`gameObject${object.id}`]);
        }
      });

      this.draggingComponents.forEach(component => {
        const gameObject = component.props.gameObject;
        component.multipleDragOffsetX = gameObject.multipleDragOffsetX || gameObject.center_x - this.dragStartMouseInfo.x.original;
        component.multipleDragOffsetY = gameObject.multipleDragOffsetY || gameObject.center_y - this.dragStartMouseInfo.y.original;
      });
    }
  }

  handleFlipGameObjects() {
    const { selectedIds, selectedObjects } = this.props;
    const isFlipped = !selectedObjects.some(object => object.is_fliped);
    this.props.flipGameObjects(selectedIds, isFlipped);
    const updates = selectedIds.map(id => {
      return serializeGameObject({id, is_fliped: isFlipped});
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
      App.game.update_game_objects(updates.map(serializeGameObject));
    }
  }

  handleCreateDeck() {
    const { selectedIds, selectedObjects } = this.props;
    if (selectedObjects.some(object => object.meta_type !== 'GameObjectMetum')) {
      alert('invalid objects');
      return;
    }

    App.game.create_deck(selectedIds);
  }

  handleDragStart(event) {
    const { selectedIds } = this.props;

    this.dragStartMouseInfo = this.props.extractMouseEvent(event);
    this.dragStarting = true;
    this.props.dragGameObjects(selectedIds);
  }

  handleDragGameObjects(event) {
    if (!this.draggingComponents.length) {
      return;
    }

    const mouseInfo = this.props.extractMouseEvent(event);
    this.draggingComponents.forEach(component => {
      component.setState({
        centerX: mouseInfo.x.original + component.multipleDragOffsetX,
        centerY: mouseInfo.y.original + component.multipleDragOffsetY,
      });
    });
  }

  handleDropGameObjects() {
    if (!this.draggingComponents.length) {
      return;
    }

    const objects = this.draggingComponents.map(component => {
      const gameObject = component.props.gameObject;
      if (gameObject.id === 'fakeDragging') {
        return alert('Fetal error: drop before draw success');
      }
      return {
        id: gameObject.id,
        container_id: null,
        lock_version: gameObject.lock_version,
        center_x: component.state.centerX,
        center_y: component.state.centerY,
      };
    });
    this.draggingComponents = [];
    this.props.dropGameObjects(objects);
    if (this.joiningDeck) {
      this.joiningDeck = false;
    } else {
      App.game.update_game_objects(objects.map(serializeGameObject));
    }
  }

  handleDestroyGameObjects() {
    const { selectedIds } = this.props;

    if (confirm('Sure to destroy selected objects?')) {
      App.game.destroy_game_objects(selectedIds);
    }
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

  handleDrawGameObject(deckObject, targetObject, event) {
    const { selectedIds } = this.props;
    if (selectedIds.length > 1 || selectedIds[0] !== deckObject.id) {
      return this.handleDragStart(event);
    }

    this.dragStartMouseInfo = this.props.extractMouseEvent(event);
    this.dragStarting = true;
    const templateId = targetObject ? targetObject.id : deckObject.id;
    const targetId = targetObject ? targetObject.id : undefined;
    this.props.startDrawingGameObject(deckObject.id, templateId);
    App.game.draw(deckObject.meta.id, targetId)
  }

  handleToggleDeck() {
    const { selectedObjects } = this.props;
    if (selectedObjects.length > 1 || selectedObjects[0].meta_type !== 'Deck') {
      console.log('invalid selects');
      return;
    }

    const deck = selectedObjects[0].meta;
    App.game.toggle_deck(deck.id, !deck.is_expanded);
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
    case 80:
      return this.handleCreateDeck();
    case 70:
      return this.handleFlipGameObjects();
    case 82:
      return this.handleRotateGameObjects(45);
    case 69:
      return this.handleToggleDeck();
    case 46:
      return this.handleDestroyGameObjects();
    default:
      return;
    }
  }

  handleSelectGameObject(id) {
    const playerNum = this.props.authentication.player_num;
    this.props.selectGameObject(playerNum, id);
    App.game.lock_game_object(id);
  }

  handleUnselectGameObjects(ids) {
    const unselectIds = ids || this.props.selectedIds;
    this.props.unselectGameObjects(unselectIds);
    App.game.release_game_objects(unselectIds);
  }

  renderGameObject(object, playerNum) {
    const id = object.id;
    const isSelected = object.is_locked && object.player_num === playerNum;
    const isLocked = object.is_locked && object.player_num !== playerNum;
    return <GameObject
      key={id}
      ref={`gameObject${id}`}
      gameObject={object}
      isSelected={isSelected}
      isLocked={isLocked}
      onSelect={this.handleSelectGameObject.bind(this, id)}
      onRelease={this.handleUnselectGameObjects.bind(this, [id])}
      onDragStart={this.handleDragStart.bind(this)}
      releaseAll={this.handleUnselectGameObjects.bind(this)}
      joinDeck={this.handleJoinDeck.bind(this)}
      draw={this.handleDrawGameObject.bind(this, object)}
    />
  }

  renderPlayerArea(area, playerNum) {
    const id = area.id;
    return <PlayerArea
      key={id}
      ref={`playerArea${id}`}
      playerArea={area}
      isOwner={area.player_num === playerNum}
    />
  }

  render() {
    const { playerAreas, gameObjects, authentication } = this.props;

    return (
      <div className="game-object-container" onKeyDown={this.handleKeyDown.bind(this)}>
        { playerAreas.map(area => this.renderPlayerArea(area, authentication.player_num)) }
        { gameObjects.filter(object => !object.container_id).map(object => this.renderGameObject(object, authentication.player_num)) }
      </div>
    );
  }
}

GameObjectContainer.propTypes = {
  authentication: PropTypes.object,
  playerAreas: PropTypes.array,
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
  receivePlayerAreas: PropTypes.func,
  removeGameObjects: PropTypes.func,
  startDrawingGameObject: PropTypes.func,
  endDrawingGameObject: PropTypes.func,
};

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
    receivePlayerAreas,
    removeGameObjects,
    startDrawingGameObject,
    endDrawingGameObject,
  }, dispatch);
}

export default connect(gameObjectContainerSelector, dispatcher)(GameObjectContainer);
