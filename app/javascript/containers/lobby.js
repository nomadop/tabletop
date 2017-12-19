import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { newMessage } from '../actions/lobby';
import Navigator from '../components/navigator';

class Lobby extends Component {
  componentDidMount() {
    App.chat.register_receiver(this.handleReceiveMessage.bind(this));
  }

  componentWillUnmount() {
    App.chat.unregister_receiver(this.handleReceiveMessage.bind(this));
  }

  handleReceiveMessage(data) {
    this.props.newMessage(data.message);
  }

  handleInput(e) {
    if (e.keyCode === 13) {
      const target = e.target;
      App.chat.speak(target.value);
      target.value = '';
      e.preventDefault();
    }
  }

  renderRoom(room) {
    return (
      <li key={room.join_path}>
        <span className="name">{room.name}</span>
        <span className="join-path"><a href={room.join_path} data-method="post">加入</a></span>
      </li>
    )
  }

  render() {
    const { authentication, messages, rooms, games } = this.props;

    const navNode = (
      <Navigator>
        <span>
          欢迎!
          <img src={authentication.avatar_info.thumb.url} alt="thumb_avatar"/>
          {authentication.username}
        </span>
        <a href="/users/edit_avatar">更换头像</a>
        <a rel="nofollow" data-method="delete" href="/users/sign_out">登出</a>
      </Navigator>
    );

    return (
      <div className="lobby-app">
        {navNode}
        <h1>大厅</h1>
        <ul>{messages.map(msg => <li>{msg}</li>)}</ul>
        <ul>{rooms.map(room => this.renderRoom(room))}</ul>
        <form action="/rooms" method="post">
          <select name="game_id" id="create_room_game_id">
            {games.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}
          </select>
          <input type="text" name="name" id="create_room_name" placeholder="房间名" />
          <input type="submit" value="创建房间" />
        </form>
      </div>
    );
  }
}

Lobby.propTypes = {
  rooms: PropTypes.array,
  games: PropTypes.array,
  authentication: PropTypes.object,
  messages: PropTypes.arrayOf(PropTypes.string),
  newMessage: PropTypes.func,
};

function selector(state) {
  return {
    messages: state.messages,
  };
}

function dispatcher(dispatch) {
  return bindActionCreators({
    newMessage,
  }, dispatch);
}

export default connect(selector, dispatcher)(Lobby);
