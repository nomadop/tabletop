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
    const { center_x, center_y, width, height, rotate } = playerArea;
    const left = center_x - width / 2;
    const top = center_y - height / 2;
    const transform = `rotate(${rotate}deg)`;

    return {
      top,
      left,
      width,
      height,
      transform,
    };
  }

  get className() {
    const playerNum = this.props.playerArea.player_num;
    const classNames = ['player-area', `player${playerNum}`, 'undraggable'];

    return classNames.join(' ');
  }

  handleDestroy() {
    if (confirm('确定删除区域?')) {
      App.game.destroy_player_area();
    }
  }

  handleSetCamera() {
    const { playerArea, setCamera } = this.props;
    const { center_x, center_y, rotate } = playerArea;
    setCamera({
      centerX: center_x,
      centerY: center_y,
      rotate: -rotate,
    });
  }

  renderHeader() {
    const { playerArea } = this.props;
    const username = playerArea.username;
    const title = `玩家${playerArea.player_num}${username ? `(${username})` : null}`;
    return (
      <div className="area-header">
        <span className="title">{title}</span>
        <span className="control">
          <i className="fa fa-video-camera" onClick={this.handleSetCamera.bind(this)}/>
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
  setCamera: PropTypes.func,
};
