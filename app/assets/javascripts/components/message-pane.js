import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import AudioContent from './audio_content';

export default class MessagePane extends Component {
  constructor() {
    super(...arguments);

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
    if (message.length) {
      input.value = '';
      this.props.sendMessage(message);
    }
  }

  handleNSResize(direction, event) {
    const { clientX, clientY } = event;
    if (!clientY && !clientX) {
      return;
    }

    let width = clientX - 10;
    let height = window.innerHeight - clientY + 10;
    if (width > 640) {
      width = 640;
    } else if (width < 320) {
      width = 320;
    }

    if (height > 480) {
      height = 480;
    } else if (height < 240) {
      height = 240;
    }

    const newState = {};
    if (direction & 1) {
      newState.height = height;
    }

    if (direction & 2) {
      newState.width = width;
    }

    this.setState(newState);
  }

  getMessageClassName(msg) {
    const classNames = ['message', msg.level];
    if (msg.from_name === this.props.authentication.username) {
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
        <span className="resizer top-resizer" onDrag={this.handleNSResize.bind(this, 1)} draggable="true"/>
        <span className="resizer right-resizer" onDrag={this.handleNSResize.bind(this, 2)} draggable="true"/>
        <span className="resizer top-right-resizer" onDrag={this.handleNSResize.bind(this, 3)} draggable="true"/>
      </div>
    );
  }
}

MessagePane.propTypes = {
  messages: PropTypes.array,
  disableKeyEvent: PropTypes.func,
  sendMessage: PropTypes.func,
  authentication: PropTypes.object,
};
