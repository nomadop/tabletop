import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import GameObject from './game_object';

export default class PlayerArea extends Component {
  componentDidMount() {
    const { playerArea } = this.props;
    const body = ReactDOM.findDOMNode(this.refs.body);
    body.setAttribute('dropable', true);
    body.setAttribute('container-id', playerArea.id);
    body.setAttribute('container-type', 'PlayerArea');
  }

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
    const classNames = ['player-area', `player${playerNum}`, 'unselectable', 'undraggable'];

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

  renderInnerObject(object) {
    const { isOwner, onSelect, onRelease, onDragStart, onJoinDeck, onDraw } = this.props;
    const id = object.id;
    const isSelected = object.is_locked && isOwner;
    const isLocked = !isOwner;
    return <GameObject
      key={id}
      ref={`gameObject${id}`}
      gameObject={object}
      isSelected={isSelected}
      isLocked={isLocked}
      onSelect={onSelect.bind(undefined, id)}
      onRelease={onRelease}
      onDragStart={onDragStart}
      joinDeck={onJoinDeck}
      draw={onDraw.bind(undefined, object)}
    />
  }

  render() {
    const { playerArea } = this.props;

    return (
      <div ref="body" className={this.className} style={this.style}>
        {this.renderHeader()}
        {playerArea.innerObjects.map(object => this.renderInnerObject(object))}
      </div>
    );
  }
}

PlayerArea.propTypes = {
  playerArea: PropTypes.object,
  isOwner: PropTypes.bool,
  onSelect: PropTypes.func,
  onRelease: PropTypes.func,
  onDragStart: PropTypes.func,
  onJoinDeck: PropTypes.func,
  onDraw: PropTypes.func,
};
