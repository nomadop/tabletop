import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PerspectiveLayer from '../components/perspective_layer';
import DirectorLayer from '../components/director_layer';
import CoordinationLayer from '../components/coordination_layer';
import CreateObjectPane from '../components/create_object_pane';
import GamePane from '../components/game_pane';
import MessagePane from '../components/message-pane';
import DragBox from 'components/drag_box';
import GameObjectContainer from './game_object';
import {
  moveCameraHorizontal,
  moveCameraVertical,
  zoomCamera,
  rotateCameraHorizontal,
  rotateCameraVertical,
} from '../actions/camera';
import {
  fetchGameData,
  unselectGameObjects,
  receiveGameObjectMeta,
  removeGameObjectMeta,
} from '../actions/game';
import { receiveMessages } from '../actions/message';
import {
  originalToPerspective,
  perspectiveToOriginal,
  perspectiveToScreen,
  screenToPerspective,
  rotateByPoint,
} from '../utils/coordination_transformer';
import { gameContainerSelector } from '../selectors/game';
import { initRecording, startRecording, stopRecording, getBase64 } from '../utils/recorder';
import { arrayMinus } from '../utils/array_enhancement';

class Game extends Component {
  constructor() {
    super(...arguments);

    this.localMsgSendCount = 0;
    this.state = {
      width: undefined,
      height: undefined,
      drawMode: false,
      selectMode: false,
    };
  }

  componentDidMount() {
    this.gameReceiver = (data) => {
      switch (data.action) {
      case 'close_room':
        alert('Room is closed by host');
        window.location.href = '/';
        return;
      case 'new_message':
        const message = data.message;
        message.newReceived = true;
        if (message.from_name !== this.props.authentication.username) {
          this.props.receiveMessages([message]);
        }
        return;
      case 'new_meta':
        return this.props.receiveGameObjectMeta([data.meta]);
      case 'destroy_meta':
        return this.props.removeGameObjectMeta(data.meta_ids);
      case 'lock_success':
      case 'lock_failed':
      case 'lock_error':
        return setTimeout(() => window.requiringLock = false, 100);
      case 'error':
        return this.handleSystemWarning(data.message);
      default:
        return;
      }
    };

    App.game.register_receiver(this.gameReceiver);

    this.props.fetchGameData(this.props.room.id);
    setTimeout(this.resizeGameWindow.bind(this), 100);

    window.addEventListener('resize', this.resizeGameWindow.bind(this));
    window.addEventListener('mousewheel', this.handleMouseWheel.bind(this));
    window.addEventListener('contextmenu', e => e.preventDefault());
    initRecording(this.handleSystemWarning.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeGameWindow.bind(this));
  }

  componentWillReceiveProps() {
    if (this.state.drawMode) {
      return false;
    }
  }

  handleDisableKeyEvent(isDisabled) {
    this.isKeyEventDisabled = isDisabled;
  }

  handleKeyDown(e) {
    const { keyCode, metaKey, altKey } = e;
    if (metaKey && altKey && keyCode === 73) {
      return;
    }

    if (this.isKeyEventDisabled) {
      return;
    }

    if (altKey) {
      console.log(keyCode);
    }
    switch (keyCode.toString()) {
    case '65':
      return this.props.moveCameraHorizontal(-50);
    case '87':
      return this.props.moveCameraVertical(-50);
    case '68':
      return this.props.moveCameraHorizontal(50);
    case '83':
      return this.props.moveCameraVertical(50);
    case '187':
      return this.props.zoomCamera(0.01);
    case '189':
      return this.props.zoomCamera(-0.01);
    case '37':
      return this.props.rotateCameraHorizontal(10);
    case '39':
      return this.props.rotateCameraHorizontal(-10);
    case '38':
      return this.props.rotateCameraVertical(1);
    case '40':
      return this.props.rotateCameraVertical(-1);
    case '72':
      this.mouseDownInfo = null;
      return this.setState({ drawMode: !this.state.drawMode });
    case '75':
      if (this.recording) {
        return;
      }

      this.recording = true;
      return startRecording();
    default:
      return null;
    }
  }

  handleKeyUp(e) {
    if (this.isKeyEventDisabled) {
      return;
    }

    if (e.keyCode === 75) {
      this.recording = false;
      stopRecording(() => getBase64(this.handleSendMessage.bind(this, '')));
    }
  }

  searchEventPath(event, checker) {
    let target = event.target;
    let result = null;
    while (target) {
      if (checker(target)) {
        result = target;
        break;
      }

      target = target.parentNode;
    }

    return result;
  }

  handleMouseWheel(event) {
    if (this.searchEventPath(event, t => t.getAttribute && t.getAttribute('class') === 'pop-up-layer')) {
      return;
    }

    event.preventDefault();
    const deltaY = event.deltaY;
    const deltaX = event.deltaX;
    if (Math.abs(event.wheelDelta) >= 120) {
      const offset = Math.abs(deltaY) >= 100 ? deltaY * Math.abs(event.wheelDelta) * 0.00001 : deltaY * -0.001;
      this.props.zoomCamera(offset);
    } else if (event.shiftKey) {
      this.props.rotateCameraHorizontal(deltaX);
      this.props.rotateCameraVertical(deltaY);
    } else {
      this.props.moveCameraHorizontal(deltaX * 3);
      this.props.moveCameraVertical(deltaY * 3);
    }
  }

  handleMouseDown(event) {
    this.mouseDownInfo = this.extractMouseEvent(event);

    const selectedIds = this.props.selectedIds;
    const onGameObject = event.target.className.search('game-object') >= 0;
    if (!onGameObject && selectedIds.length > 0) {
      this.props.unselectGameObjects(selectedIds);
      App.game.release_game_objects(selectedIds);
    }
  }

  extractDrawBoxProperties(event) {
    const camera = this.props.camera;
    const mouseInfo = this.extractMouseEvent(event);
    const topY = this.mouseDownInfo.y.original;
    const leftX = this.mouseDownInfo.x.original;
    const rightX = mouseInfo.x.original;
    const bottomY = mouseInfo.y.original;
    const centerX = (leftX + rightX) / 2;
    const centerY = (topY + bottomY) / 2;
    const rotatedTopLeft = rotateByPoint([leftX, topY], [centerX, centerY], camera.rotate);
    const rotatedBottomRight = rotateByPoint([rightX, bottomY], [centerX, centerY], camera.rotate);
    const width = rotatedBottomRight[0] - rotatedTopLeft[0];
    const height = rotatedBottomRight[1] - rotatedTopLeft[1];
    const rotate = -camera.rotate;
    return {
      centerX,
      centerY,
      rotatedTopLeft,
      rotatedBottomRight,
      width,
      height,
      rotate,
    };
  }

  handleMouseMove(event) {
    if (!event.buttons) {
      return;
    }

    if (this.state.drawMode) {
      const drawBox = this.refs.drawBox;
      const { rotatedTopLeft, width, height, rotate } = this.extractDrawBoxProperties(event);
      drawBox.setState({
        top: rotatedTopLeft[1],
        left: rotatedTopLeft[0],
        width: width < 0 ? 0 : width,
        height: height < 0 ? 0 : height,
        rotate: rotate,
      });
    } else if (this.state.selectMode) {
      const selectBox = this.refs.selectBox;
      const startX = this.mouseDownInfo.x.screen;
      const startY = this.mouseDownInfo.y.screen;
      const { clientX, clientY } = event;
      const top = Math.min(startY, clientY);
      const left = Math.min(startX, clientX);
      const width2 = Math.abs(startX - clientX);
      const height2 = Math.abs(startY - clientY);
      selectBox.setState({
        top: top,
        left: left,
        width: width2,
        height: height2,
      });
      const { gameObjects, selectedObjects, authentication } = this.props;
      const boxingObjects = gameObjects.filter(object => {
        const {center_x, center_y, is_locked, player_num, container_id, container_type} = object;
        const checkDeck = !container_id || container_type !== 'Deck';
        if (!checkDeck) {
          return false;
        }

        const checkAccess = !is_locked || player_num === authentication.player_num;
        if (!checkAccess) {
          return false;
        }

        const {x, y} = this.transformOriginalPoint([center_x, center_y]);
        const checkX = x > left && x < left + width2;
        if (!checkX) {
          return false;
        }

        const checkY = y > top && y < top + height2;
        if (!checkY) {
          return false;
        }

        return true;
      });
      const selectingObjects = arrayMinus(boxingObjects, selectedObjects);
      if (selectingObjects.length) {
        App.game.lock_game_object(selectingObjects.map(obj => obj.id));
      }

      const unselectingObjects = arrayMinus(selectedObjects, boxingObjects);
      if (unselectingObjects.length) {
        App.game.release_game_objects(unselectingObjects.map(obj => obj.id));
      }
    } else if (event.nativeEvent.which === 3) {
      if (this.searchEventPath(event, t => t.getAttribute && t.getAttribute('class') === 'pop-up-layer')) {
        return;
      }

      const { movementX, movementY } = event.nativeEvent;
      if (event.shiftKey) {
        this.props.rotateCameraHorizontal(movementX);
        this.props.rotateCameraVertical(movementY);
      } else {
        const scale = this.props.camera.scale;
        this.props.moveCameraHorizontal(movementX / scale);
        this.props.moveCameraVertical(movementY / scale);
      }
    } else if (!this.props.isDragging) {
      const checker = t => {
        return (
          t.getAttribute &&
          t.getAttribute('class') && (
          t.getAttribute('class').search('game-object') >= 0 ||
          t.getAttribute('class') === 'pop-up-layer'
        ));
      };
      if (this.searchEventPath(event, checker)) {
        return;
      }

      window.selectMode = true;
      this.setState({ selectMode: true });
    }
  }

  handleMouseUp(event) {
    if (this.state.drawMode) {
      if (confirm('确定创建区域?')) {
        const { centerX, centerY, width, height, rotate } = this.extractDrawBoxProperties(event);
        App.game.create_player_area({
          center_x: centerX,
          center_y: centerY,
          width,
          height,
          rotate,
        });
      }

      this.setState({ drawMode: false });
    } else if (this.state.selectMode) {
      window.selectMode = false;
      this.setState({ selectMode: false });
    }
  }

  handleSendLocalMessage(message) {
    this.localMsgSendCount++;
    message.id = 'localSendMsg' + this.localMsgSendCount;
    this.props.receiveMessages([message]);
  }

  handleSendMessage(content, mp3) {
    if (content.length > 255) {
      return this.handleSystemWarning('输入过长.');
    }

    const authentication = this.props.authentication;
    this.handleSendLocalMessage({
      from_name: authentication.username,
      from_avatar: authentication.avatar_info.thumb.url,
      from_player: authentication.player_num,
      level: 'normal',
      content,
      msg_type: mp3 ? 'audio' : 'text',
      mp3: {url: mp3},
    });
    App.game.send_message(content, mp3);
  }

  handleSystemWarning(content) {
    this.handleSendLocalMessage({
      from_name: '系统警告',
      from_avatar: '/uploads/avatar/anonymous/thumb_anonymous.png',
      level: 'warning',
      content
    });
  }

  resizeGameWindow() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  extractMouseEvent(event) {
    const { width, height } = this.state;
    const { centerX, centerY, rotate, angle, perspective, scale } = this.props.camera;
    const { clientX, clientY } = event;
    const screenPoint = [clientX - width / 2, clientY - height / 2];
    const perspectivePoint = screenToPerspective(screenPoint, perspective, angle);
    const originalPoint = perspectiveToOriginal(perspectivePoint, centerX, centerY, rotate, scale);
    return {
      x: { screen: clientX, original: originalPoint[0] },
      y: { screen: clientY, original: originalPoint[1] },
    };
  }

  transformOriginalPoint(originalPoint) {
    const { width, height } = this.state;
    const { centerX, centerY, rotate, angle, perspective, scale } = this.props.camera;
    const perspectivePoint = originalToPerspective(originalPoint, centerX, centerY, rotate, scale);
    const screenPoint = perspectiveToScreen(perspectivePoint, perspective, angle);
    return {
      x: screenPoint[0] + width / 2,
      y: screenPoint[1] + height / 2,
    };
  }

  renderGameMenu() {
    const { room } = this.props;

    return (
      <GamePane className="game-menu" title="菜单" width={240} height={480}>
        <a href={`/rooms/${room.id}/leave`} data-method="post">离开房间</a>
        <a href={`/rooms/${room.id}`} data-method="delete">关闭房间</a>
      </GamePane>
    )
  }

  renderActionBlocker(style) {
    if (this.state.drawMode) {
      return <div className="action-blocker" style={style}></div>;
    }
  }

  renderCreateMetaPane() {
    if (this.props.dev_mode) {
      return (
        <GamePane className="create-meta-pane" title="创建元物件" width={385} height={550}>
          <iframe src="/game_object_meta/new" frameBorder="0"></iframe>
        </GamePane>
      );
    }
  }

  renderPopUpLayer(width, height) {
    const { meta, messages, dev_mode } = this.props;
    const style = {
      width,
      height,
    };

    return (
      <div className="pop-up-layer">
        {this.renderActionBlocker(style)}
        {this.renderSelectBox()}
        <div className="footer" style={{bottom: -height || 0}}>
          <MessagePane messages={messages}
                       disableKeyEvent={this.handleDisableKeyEvent.bind(this)}
                       sendMessage={this.handleSendMessage.bind(this)}
                       authentication={this.props.authentication}
          />
          <div className="footer-right">
            <div className="pane-container">
              {this.renderGameMenu()}
              <CreateObjectPane meta={meta} devMode={dev_mode} systemWarning={this.handleSystemWarning.bind(this)}/>
              {this.renderCreateMetaPane()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderCoordination() {
    if (this.props.debug) {
      return <CoordinationLayer rows={10} cols={10} size={100}/>;
    } else {
      return <span className="origin-point"/>
    }
  }

  renderDrawBox() {
    if (this.state.drawMode) {
      return <DragBox ref="drawBox"/>;
    }
  }

  renderSelectBox() {
    if (this.state.selectMode) {
      return <DragBox ref="selectBox"/>;
    }
  }

  render() {
    const { width, height } = this.state;
    const { camera, authentication } = this.props;

    const style = {
      width,
      height,
    };

    return (
      <div
        className="game-window"
        tabIndex="1"
        ref="gameWindow"
        style={style}
        onKeyDown={this.handleKeyDown.bind(this)}
        onKeyUp={this.handleKeyUp.bind(this)}
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
        onMouseUp={this.handleMouseUp.bind(this)}
      >
        {this.renderPopUpLayer(width, height)}
        <PerspectiveLayer width={width} height={height} camera={camera}>
          <DirectorLayer width={width} height={height} camera={camera}>
            {this.renderCoordination()}
            <GameObjectContainer authentication={authentication} extractMouseEvent={this.extractMouseEvent.bind(this)}/>
            {this.renderDrawBox()}
          </DirectorLayer>
        </PerspectiveLayer>
      </div>
    );
  }
}

Game.propTypes = {
  debug: PropTypes.bool,
  dev_mode: PropTypes.bool,
  camera: PropTypes.object,
  moveCameraHorizontal: PropTypes.func,
  moveCameraVertical: PropTypes.func,
  rotateCameraHorizontal: PropTypes.func,
  rotateCameraVertical: PropTypes.func,
  zoomCamera: PropTypes.func,
  game: PropTypes.object,
  room: PropTypes.object,
  authentication: PropTypes.object,
  fetchGameData: PropTypes.func,
  unselectGameObjects: PropTypes.func,
  selectedIds: PropTypes.array,
  isDragging: PropTypes.bool,
  messages: PropTypes.array,
  receiveMessages: PropTypes.func,
  receiveGameObjectMeta: PropTypes.func,
  removeGameObjectMeta: PropTypes.func,
  gameObjects: PropTypes.array,
  selectedObjects: PropTypes.array,
};

function dispatcher(dispatch) {
  return bindActionCreators({
    moveCameraHorizontal,
    moveCameraVertical,
    zoomCamera,
    rotateCameraHorizontal,
    rotateCameraVertical,
    fetchGameData,
    unselectGameObjects,
    receiveMessages,
    receiveGameObjectMeta,
    removeGameObjectMeta,
  }, dispatch);
}

export default connect(gameContainerSelector, dispatcher)(Game);
