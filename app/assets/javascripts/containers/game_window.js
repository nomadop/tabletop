import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class GameWindow extends Component {
  componentDidMount() {
    this.resizeGameWindow();

    window.addEventListener('resize', this.resizeGameWindow.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeGameWindow.bind(this));
  }

  resizeGameWindow() {
    const style = this.refs.gameWindow.style;
    style.height = window.innerHeight + 'px';
    style.width = window.innerWidth + 'px';
  }

  render() {
    return (
      <div className="game-window" ref="gameWindow">
      </div>
    );
  }
}

export default connect()(GameWindow);