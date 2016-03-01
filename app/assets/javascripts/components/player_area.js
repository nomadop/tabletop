import React, { Component, PropTypes } from 'react';

export default class PlayerArea extends Component {
  get style() {
    const { playerArea } = this.props;
    const { center_x, center_y, width, height } = playerArea;
    const left = center_x - width / 2;
    const top = center_y - height / 2;

    return {
      top,
      left,
      width,
      height,
    };
  }

  get className() {
    const playerNum = this.props.playerArea.player_num;
    const classNames = ['player-area', `player${playerNum}`];

    return classNames.join(' ');
  }

  render() {
    return (
      <div className={this.className} style={this.style}>
      </div>
    );
  }
}

PlayerArea.propTypes = {
  playerArea: PropTypes.object,
  isOwner: PropTypes.bool,
};
