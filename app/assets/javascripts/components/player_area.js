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

  handleDestroy() {
    if (confirm('Destroy player area')) {
      App.game.destroy_player_area();
    }
  }

  renderHeader() {
    const { playerArea } = this.props;
    const username = playerArea.username;
    const title = `player${playerArea.player_num}${username ? `(${username})` : null}`;
    return (
      <div className="area-header">
        <span className="title">{title}</span>
        <span className="control">
          <i className="fa fa-retweet"/>
          <i className="fa fa-cog"/>
          <i className="fa fa-times" onClick={this.handleDestroy}/>
        </span>
      </div>
    )
  }

  render() {
    return (
      <div className={this.className} style={this.style}>
        {this.renderHeader()}
      </div>
    );
  }
}

PlayerArea.propTypes = {
  playerArea: PropTypes.object,
  isOwner: PropTypes.bool,
};
