import React, { Component, PropTypes } from 'react';
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

  render() {
    const { authentication, messages } = this.props;
    let navNode;
    if (!authentication) {
      navNode = (
        <Navigator>
          <a href="/users/sign_in">Log in</a>
        </Navigator>
      );
    } else {
      navNode = (
        <Navigator>
          <span>Welcome! {authentication.email}</span>
          <a rel="nofollow" data-method="delete" href="/users/sign_out">Log out</a>
        </Navigator>
      );
    }

    return (
      <div className="lobby-app">
        {navNode}
        <h1>Lobby</h1>
        <ul>{messages.map(msg => <li>{msg}</li>)}</ul>
        <input type="text" onKeyDown={this.handleInput}/>
      </div>
    );
  }
}

Lobby.propTypes = {
  authentication: PropTypes.object,
  messages: PropTypes.arrayOf(PropTypes.string),
  newMessage: PropTypes.func,
};

function selector(state) {
  return {
    authentication: state.authentication,
    messages: state.messages,
  };
}

function dispatcher(dispatch) {
  return bindActionCreators({
    newMessage,
  }, dispatch);
}

export default connect(selector, dispatcher)(Lobby);
