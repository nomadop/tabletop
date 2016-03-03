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

  renderMessages() {
    const { messages } = this.props;
    return messages.map(msg => (
      <div key={msg.id} className={`message ${msg.level}`}>
        <span className="from">{msg.from_name + ':'}</span>
        <span className="content">{msg.content}</span>
      </div>
    ));
  }

  render() {
    return (
      <div className="message-pane" style={this.style}>
        <div className="message-container unselectable" ref="messageContainer">
          {this.renderMessages()}
        </div>
      </div>
    );
  }
}

MessagePane.propTypes = {
  messages: PropTypes.array,
  bottom: PropTypes.number,
};
