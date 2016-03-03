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
    input.value = '';
    App.game.send_message(message);
  }

  renderMessages() {
    const { messages } = this.props;
    return messages.map(msg => (
      <div key={msg.id} className={`message ${msg.level}`}>
        <span className="from">{msg.from_name}</span>
        <span className="speak-spliter">:</span>
        <span className="content">{msg.content}</span>
      </div>
    ));
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
          />
          <span className="send" onClick={this.handleSendMessage.bind(this)}>Send</span>
        </div>
      </div>
    );
  }
}

MessagePane.propTypes = {
  messages: PropTypes.array,
  bottom: PropTypes.number,
  disableKeyEvent: PropTypes.func,
};
