import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PerspectiveLayer from '../components/perspective_layer';
import DirectorLayer from '../components/director_layer';
import CoordinationLayer from '../components/coordination_layer';
import CreateObjectPane from 'components/create_object_pane';
import GameObjectContainer from './game_object';
import {
  moveCameraHorizontal,
  moveCameraVertical,
  zoomCamera,
  rotateCameraHorizontal,
  rotateCameraVertical,
} from '../actions/camera';
import { fetchGameData } from '../actions/game';
import {
  originalToPerspective,
  perspectiveToOriginal,
  perspectiveToScreen,
  screenToPerspective,
} from '../utils/coordination_transformer';

class Game extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      width: undefined,
      height: undefined,
    };
  }

  componentDidMount() {
    this.props.fetchGameData(this.props.game.id);
    setTimeout(this.resizeGameWindow.bind(this), 100);

    window.addEventListener('resize', this.resizeGameWindow.bind(this));
    window.addEventListener('mousewheel', this.handleMouseWheel.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeGameWindow.bind(this));
  }

  handleKeyDown(e) {
    const { keyCode, metaKey, altKey } = e;
    if (metaKey && altKey && keyCode === 73) {
      return true;
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
    default:
      return null;
    }
  }

  handleMouseWheel(event) {
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
    const mouseInfo = this.extractMouseEvent(event);
    this.lastMouseX = mouseInfo.x;
    this.lastMouseY = mouseInfo.y;
    this.mouseDownX = mouseInfo.x;
    this.mouseDownY = mouseInfo.y;
  }

  handleCreateGameObject(meta_id) {
    App.game.create_game_object(meta_id);
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

  renderPopUpLayer() {
    const { meta, game } = this.props;

    return (
      <div className="pop-up-layer">
        <div className="pane-container">
          <CreateObjectPane meta={meta} module={game.module} createGameObject={this.handleCreateGameObject}/>
        </div>
      </div>
    )
  }

  renderCoordination() {
    if (this.props.debug) {
      return <CoordinationLayer rows={10} cols={10} size={100}/>;
    }
  }

  render() {
    const { width, height } = this.state;
    const { camera } = this.props;

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
      >
        {this.renderPopUpLayer()}
        <PerspectiveLayer width={width} height={height} camera={camera}>
          <DirectorLayer width={width} height={height} camera={camera}>
            {this.renderCoordination()}
            <GameObjectContainer extractMouseEvent={this.extractMouseEvent.bind(this)}/>
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
  authentication: PropTypes.object,
  fetchGameData: PropTypes.func,
};

function selector(state) {
  const metaById = state.meta.byId;
  const meta = state.meta.ids.map(id => metaById[id]);
  return {
    camera: state.camera,
    meta,
  };
}

function dispatcher(dispatch) {
  return bindActionCreators({
    moveCameraHorizontal,
    moveCameraVertical,
    zoomCamera,
    rotateCameraHorizontal,
    rotateCameraVertical,
    fetchGameData,
  }, dispatch);
}

export default connect(selector, dispatcher)(Game);
