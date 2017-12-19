import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class PlayerPane extends Component {
  renderPlayer(player) {
    return (
      <div className="player" key={player.number}>
        <span className="player-num">{`玩家${player.number}`}</span>
        <span className="username">{player.user.username}</span>
        <span className="avatar"><img src={player.user.avatar_info.url}/></span>
      </div>
    );
  }

  render() {
    const { players } = this.props;

    return (
      <div className="player-pane" style={this.style}>
        {players.map(player => this.renderPlayer(player))}
      </div>
    );
  }
}

PlayerPane.propTypes = {
  players: PropTypes.array,
};
