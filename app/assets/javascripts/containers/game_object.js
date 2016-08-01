import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GameObject from '../components/game_object';
import PlayerArea from '../components/player_area';
import * as KeyCode from '../utils/key_codes';
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
  removePlayerArea,
  toggleEditObjectPane,
} from '../actions/game';
import { setCamera } from '../actions/camera';
import { rotateByPoint } from '../utils/coordination_transformer';
import { serializeGameObject, unserializeGameObject } from '../serializers/game_object';
import { gameObjectContainerSelector} from '../selectors/game';

class GameObjectContainer extends Component {
  componentDidMount() {
    this.gameObjectReceivers = (data) => {
      switch (data.action) {
      case 'create_game_object':
      case 'update_game_object':
        return this.props.receiveGameObjects([unserializeGameObject(data.keys, data.object)]);
      case 'create_game_objects':
      case 'update_game_objects':
      case 'lock_failed':
      case 'release_failed':
        const objects = data.objects.map(unserializeGameObject.bind(null, data.keys));
        return this.props.receiveGameObjects(objects);
      case 'create_deck':
        this.props.receiveDecks([data.deck]);
        return this.props.receiveGameObjects([unserializeGameObject(data.keys, data.object)]);
      case 'create_player_area':
        return this.props.receivePlayerAreas([data.area]);
      case 'update_deck':
        return this.props.receiveDecks([data.deck]);
      case 'remove_game_objects':
        return this.props.removeGameObjects(data.object_ids);
      case 'draw_success':
        if (this.dropBeforeDrawSuccessEvent) {
          setTimeout(() => {
            this.handleDropGameObjects(this.dropBeforeDrawSuccessEvent);
            this.dropBeforeDrawSuccessEvent = null;
          }, 100);
        }
        const attrs = { isDragging: true };
        const fakeDraggingComponent = this.refs.gameObjectfakeDragging;
        if (fakeDraggingComponent) {
          attrs.center_x = fakeDraggingComponent.state.centerX || fakeDraggingComponent.props.gameObject.center_x;
          attrs.center_y = fakeDraggingComponent.state.centerY || fakeDraggingComponent.props.gameObject.center_y;
          attrs.multipleDragOffsetX = fakeDraggingComponent.multipleDragOffsetX;
          attrs.multipleDragOffsetY = fakeDraggingComponent.multipleDragOffsetY;
        } else {
          const lastMouseInfo = this.props.extractMouseEvent(window.lastMouseMoveEvent);
          attrs.center_x = lastMouseInfo.x.screen;
          attrs.center_y = lastMouseInfo.y.screen;
          attrs.multipleDragOffsetX = 0;
          attrs.multipleDragOffsetY = 0;
        }
        const object = Object.assign(unserializeGameObject(data.keys, data.object), attrs);
        this.dragStarting = true;
        return this.props.endDrawingGameObject(object);
      case 'draw_failed':
        this.draggingComponents = [];
        this.dropBeforeDrawSuccessEvent = null;
        return this.props.endDrawingGameObject();
      case 'lock_game_object':
        return this.props.selectGameObject(data.player_num, data.object_id);
      case 'release_game_objects':
        return this.props.unselectGameObjects(data.object_ids);
      case 'destroy_player_area':
        return this.props.removePlayerArea(data.area_id);
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
    const serializeKeys = ['id', 'is_fliped', 'lock_version'];
    const updates = selectedObjects.map(object => {
      return serializeGameObject(serializeKeys, Object.assign({}, object, { is_fliped: isFlipped }));
    });
    App.game.update_game_objects(updates, serializeKeys);
  }

  handleRotateGameObjects(rotate) {
    const { selectedObjects, isDragging } = this.props;
    if (!isDragging) {
      const middleX = selectedObjects.reduce((result, object) => result + object.center_x, 0) / selectedObjects.length;
      const middleY = selectedObjects.reduce((result, object) => result + object.center_y, 0) / selectedObjects.length;
      const updates = selectedObjects.map(object => {
        const rotatedPosition = rotateByPoint([object.center_x, object.center_y], [middleX, middleY], rotate);
        return Object.assign({}, object, {
          rotate: object.rotate + rotate,
          center_x: rotatedPosition[0],
          center_y: rotatedPosition[1],
        });
      });
      this.props.rotateGameObjects(updates);
      const keys = ['id', 'rotate', 'center_x', 'center_y', 'lock_version'];
      App.game.update_game_objects(updates.map(serializeGameObject.bind(null, keys)), keys);
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
    if (window.selectMode) {
      return;
    }

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

  handleDropGameObjects(event) {
    if (!this.draggingComponents.length) {
      return;
    }

    let container = event.target;
    while (container) {
      if (container.getAttribute && container.getAttribute('dropable')) {
        break;
      }

      container = container.parentNode;
    }
    const containerId = container && container.getAttribute('container-id');
    const containerType = container && container.getAttribute('container-type');
    let success = true;
    const objects = this.draggingComponents.map(component => {
      const gameObject = component.props.gameObject;
      if (gameObject.id === 'fakeDragging') {
        console.log('drop before draw success');
        this.dropBeforeDrawSuccessEvent = event;
        return success = false;
      }
      gameObject.multipleDragOffsetX = null;
      gameObject.multipleDragOffsetY = null;
      const lastMouseInfo = this.props.extractMouseEvent(window.lastMouseMoveEvent);
      return {
        id: gameObject.id,
        container_id: containerId ? Number(containerId) : null,
        container_type: containerType,
        lock_version: gameObject.lock_version,
        center_x: component.state.centerX || lastMouseInfo.x.original,
        center_y: component.state.centerY || lastMouseInfo.y.original,
      };
    });
    if (!success) {
      return;
    }
    this.draggingComponents = [];
    this.props.dropGameObjects(objects);
    if (this.joiningDeck) {
      this.joiningDeck = false;
    } else {
      const keys = ['id', 'container_id', 'container_type', 'lock_version', 'center_x', 'center_y'];
      App.game.update_game_objects(objects.map(serializeGameObject.bind(null, keys)), keys);
    }
    this.refs.body.focus();
  }

  handleDestroyGameObjects() {
    const { selectedIds } = this.props;

    if (confirm('确定删除物件?')) {
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
    if (window.selectMode || this.props.isDragging) {
      return;
    }

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
    switch (event.keyCode.toString()) {
    case KeyCode.P:
      return this.handleCreateDeck();
    case KeyCode.F:
      return this.handleFlipGameObjects();
    case KeyCode.R:
      return this.handleRotateGameObjects(45);
    case KeyCode.E:
      return this.handleToggleDeck();
    case KeyCode.DEL:
      return this.handleDestroyGameObjects();
    case KeyCode.M:
      return this.handleOpenEditObjectPane();
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

  handleOpenEditObjectPane() {
    const { selectedIds } = this.props;
    selectedIds.map(id => this.props.toggleEditObjectPane(id, true));
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
      onRelease={this.handleUnselectGameObjects.bind(this)}
      onDragStart={this.handleDragStart.bind(this)}
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
      onSelect={this.handleSelectGameObject.bind(this)}
      onRelease={this.handleUnselectGameObjects.bind(this)}
      onDragStart={this.handleDragStart.bind(this)}
      onJoinDeck={this.handleJoinDeck.bind(this)}
      onDraw={this.handleDrawGameObject.bind(this)}
      setCamera={this.props.setCamera}
    />
  }

  render() {
    const { playerAreas, gameObjects, authentication } = this.props;

    return (
      <div className="game-object-container" ref="body" tabIndex="1" onKeyDown={this.handleKeyDown.bind(this)}>
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
  removePlayerArea: PropTypes.func,
  setCamera: PropTypes.func,
  toggleEditObjectPane: PropTypes.func,
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
    removePlayerArea,
    setCamera,
    toggleEditObjectPane,
  }, dispatch);
}

export default connect(gameObjectContainerSelector, dispatcher, null, { withRef: true })(GameObjectContainer);
