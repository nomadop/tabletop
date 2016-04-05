import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import AudioContent from './audio_content';

export default class MessagePane extends Component {
  constructor() {
    super(...arguments);
    const { game_type } = this.props.game;

    if (game_type === 'chat_game' && setTimeout) {
      setTimeout(this.setState.bind(this, {
        width: 320,
        height: window.innerHeight - 60,
      }), 100);
    }

    this.state = {
      width: 320,
      height: 240,
    };
  }

  get style() {
    const { width, height } = this.state;

    return {
      width,
      height,
    };
  }

  componentDidMount() {
    const messageContainer = ReactDOM.findDOMNode(this.refs.messageContainer);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  componentDidUpdate() {
    const messageContainer = ReactDOM.findDOMNode(this.refs.messageContainer);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  handleSendMessage() {
    const input = this.refs.input;
    const message = input.value;
    input.value = '';
    if (!message.length) {
      return;
    }

    if (!message.startsWith('/')) {
      return this.props.sendMessage(message);
    }

    const [command, argument] = message.slice(1).split(/ +/);
    if (command in App.game) {
      App.game[command](argument);
    } else {
      this.props.systemMessage('error', '命令不存在');
    }
  }

  handleNSResize(direction, event) {
    const { clientX, clientY } = event;
    if (!clientY && !clientX) {
      return;
    }

    const { width, height } = this.state;
    let newWidth = clientX - 10;
    let newHeight = window.innerHeight - clientY + 10;
    if (newWidth > 480) {
      newWidth = 480;
    } else if (newWidth < 320) {
      newWidth = 320;
    }

    if (newHeight > window.innerHeight - 60) {
      newHeight = window.innerHeight - 60;
    } else if (newHeight < 240) {
      newHeight = 240;
    }

    const newState = {};
    if (direction & 1 && newHeight !== height) {
      newState.height = newHeight;
    }

    if (direction & 2 && newWidth !== width) {
      newState.width = newWidth;
    }

    if (Object.keys(newState).length) {
      this.setState(newState);
    }
  }

  getMessageClassName(msg) {
    const classNames = ['message', msg.level];
    if (msg.from_player === this.props.authentication.player_num) {
      classNames.push('self');
    }

    if (msg.from_player) {
      classNames.push('player' + msg.from_player);
    }

    return classNames.join(' ');
  }

  getIconClassName(msg) {
    const iconClassNames = ['fa'];
    switch (msg.level) {
    case 'normal':
      iconClassNames.push('fa-comments');
      break;
    default:
      iconClassNames.push('fa-cogs');
      break;
    }

    return iconClassNames.join(' ');
  }

  renderContent(msg) {
    if (msg.msg_type === 'audio') {
      return <AudioContent src={msg.mp3.url} newReceived={msg.newReceived}/>;
    } else {
      return <span className="content">{msg.content}<span className="content-arrow"/></span>
    }
  }

  renderMessage(msg) {
    const msgClassName = this.getMessageClassName(msg);
    const iconClassName = this.getIconClassName(msg);

    return (
      <div key={msg.id} className={msgClassName}>
        <span className="msg-header"><img className="avatar" src={msg.from_avatar} alt="from-avatar"/></span>
        <span className="msg-body">
          <span className="from"><i className={iconClassName}/>{msg.from_name}</span>
          {this.renderContent(msg)}
        </span>
      </div>
    );
  }

  renderResizer() {
    const { game_type } = this.props.game;
    if (game_type === 'chat_game') {
      return <span className="resizer right-resizer" onDrag={this.handleNSResize.bind(this, 2)} draggable="true"/>;
    } else {
      return [
        <span className="resizer top-resizer" key="tr" onDrag={this.handleNSResize.bind(this, 1)} draggable="true"/>,
        <span className="resizer right-resizer" key="rr" onDrag={this.handleNSResize.bind(this, 2)} draggable="true"/>,
        <span className="resizer top-right-resizer" key="trr" onDrag={this.handleNSResize.bind(this, 3)} draggable="true"/>,
      ];
    }
  }

  render() {
    const { disableKeyEvent, messages } = this.props;

    return (
      <div className="message-pane" style={this.style}>
        <div className="message-container" ref="messageContainer">
          {messages.map(msg => this.renderMessage(msg))}
        </div>
        <div className="message-control">
          <input type="text"
                 className="message-input"
                 ref="input"
                 onFocus={disableKeyEvent.bind(undefined, true)}
                 onBlur={disableKeyEvent.bind(undefined, false)}
                 onKeyDown={e => e.keyCode === 13 ? this.handleSendMessage() : null}
          />
          <span className="send" onClick={this.handleSendMessage.bind(this)}>发送</span>
        </div>
        {this.renderResizer()}
      </div>
    );
  }
}

MessagePane.propTypes = {
  messages: PropTypes.array,
  disableKeyEvent: PropTypes.func,
  sendMessage: PropTypes.func,
  authentication: PropTypes.object,
  game: PropTypes.object,
  systemMessage: PropTypes.func,
};
