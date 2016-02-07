import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PerspectiveLayer from '../components/perspective_layer';

class Game extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      width: undefined,
      height: undefined,
    };
  }

  componentDidMount() {
    setTimeout(this.resizeGameWindow.bind(this), 100);

    window.addEventListener('resize', this.resizeGameWindow.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeGameWindow.bind(this));
  }

  resizeGameWindow() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  render() {
    const { width, height } = this.state;

    const style = {
      width,
      height,
    };

    return (
      <div className="game-window" tabIndex="1" ref="gameWindow" style={style}>
        <PerspectiveLayer {...this.props} width={width} height={height} />
      </div>
    );
  }
}

Game.propTypes = {
  camera: PropTypes.object,
};

function selector(state) {
  return {
    camera: state.camera,
  };
}

export default connect(selector)(Game);
