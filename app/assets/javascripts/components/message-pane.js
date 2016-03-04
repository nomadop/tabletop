import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class MessagePane extends Component {
  get style() {
    const bottom = this.props.bottom;

    return {
      left: 10,
      bottom: bottom || 10,
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
        <div className="message-container unselectable" ref="messageContainer">
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
          <span className="send unselectable" onClick={this.handleSendMessage.bind(this)}>发送</span>
        </div>
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
