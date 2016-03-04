import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PerspectiveLayer from '../components/perspective_layer';
import DirectorLayer from '../components/director_layer';
import CoordinationLayer from '../components/coordination_layer';
import CreateObjectPane from '../components/create_object_pane';
import GamePane from '../components/game_pane';
import MessagePane from '../components/message-pane';
import DrawBox from '../components/draw_box';
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

class Game extends Component {
  constructor() {
    super(...arguments);

    this.localMsgSendCount = 0;
    this.state = {
      width: undefined,
      height: undefined,
      drawMode: false,
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
        if (message.from_name !== this.props.authentication.username) {
          this.props.receiveMessages([message]);
        }
        return;
      default:
        return;
      }
    };

    App.game.register_receiver(this.gameReceiver);

    this.props.fetchGameData(this.props.room.id);
    setTimeout(this.resizeGameWindow.bind(this), 100);

    window.addEventListener('resize', this.resizeGameWindow.bind(this));
    window.addEventListener('mousewheel', this.handleMouseWheel.bind(this));
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
      this.drawStartMouseInfo = null;
      return this.setState({ drawMode: !this.state.drawMode });
    default:
      return null;
    }
  }

  handleMouseWheel(event) {
    let target = event.target;
    let available = true;
    while (target) {
      if (target.getAttribute && target.getAttribute('class') === 'pop-up-layer') {
        available = false;
        break;
      }

      target = target.parentNode;
    }

    if (!available) {
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
    if (this.state.drawMode) {
      if (!this.drawStartMouseInfo) {
        this.drawStartMouseInfo = this.extractMouseEvent(event);
      }
      return;
    }

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
    const topY = this.drawStartMouseInfo.y.original;
    const leftX = this.drawStartMouseInfo.x.original;
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
    } else if (!this.props.isDragging) {
      let target = event.target;
      let blockAction = false;
      while (target) {
        if (target.getAttribute && target.getAttribute('class') === 'pop-up-layer') {
          blockAction = true;
          break;
        }

        target = target.parentNode;
      }
      if (blockAction) {
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
    }
  }

  handleSendLocalMessage(from_name, level, content) {
    this.localMsgSendCount++;
    const message = {
      id: 'localSendMsg' + this.localMsgSendCount,
      level,
      from_name,
      content,
    };
    this.props.receiveMessages([message]);
  }

  handleSendMessage(content) {
    if (content.length > 255) {
      return this.handleSystemWarning('输入过长.');
    }

    this.handleSendLocalMessage(
      this.props.authentication.username,
      'normal',
      content
    );
    App.game.send_message(content);
  }

  handleSystemWarning(content) {
    this.handleSendLocalMessage(
      '系统',
      'warning',
      content
    );
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

  renderPopUpLayer(width, height) {
    const { meta, game, messages } = this.props;
    const style = {
      width,
      height,
    };

    return (
      <div className="pop-up-layer">
        {this.renderActionBlocker(style)}
        <MessagePane bottom={10 - height}
                     messages={messages}
                     disableKeyEvent={this.handleDisableKeyEvent.bind(this)}
                     sendMessage={this.handleSendMessage.bind(this)}
        />
        <div className="pane-container">
          {this.renderGameMenu()}
          <CreateObjectPane meta={meta} module={game.module} systemWarning={this.handleSystemWarning.bind(this)}/>
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
      return <DrawBox ref="drawBox"/>;
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
  }, dispatch);
}

export default connect(gameContainerSelector, dispatcher)(Game);
