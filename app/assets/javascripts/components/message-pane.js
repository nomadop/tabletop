import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class MessagePane extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      width: 320,
      height: 240,
    };
  }

  get style() {
    const bottom = this.props.bottom;
    const { width, height } = this.state;

    return {
      left: 10,
      bottom: bottom || 10,
      width,
      height,
    };
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

  renderMessages() {
    const { messages } = this.props;

    return messages.map(msg => {
      const iconClassNames = ['fa'];
      switch (msg.level) {
      case 'normal':
        iconClassNames.push('fa-comments');
        break;
      default:
        iconClassNames.push('fa-cogs');
        break;
      }
      const iconClassName = iconClassNames.join(' ');

      return (
        <div key={msg.id} className={`message ${msg.level}`}>
          <span className="icon"><i className={iconClassName}/></span>
          <span className="from">{msg.from_name}</span>
          <span className="speak-spliter">:</span>
          <span className="content">{msg.content}</span>
        </div>
      );
    });
  }

  render() {
    const { disableKeyEvent } = this.props;

    return (
      <div className="message-pane" style={this.style}>
        <div className="message-container" ref="messageContainer">
          {this.renderMessages()}
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
  bottom: PropTypes.number,
  disableKeyEvent: PropTypes.func,
  sendMessage: PropTypes.func,
};
