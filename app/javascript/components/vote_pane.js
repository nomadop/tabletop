import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

export default class VotePane extends Component {
  componentDidMount() {
    this.startTime = Date.now();
    this.countingDown = setInterval(this.handleCountingDown.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.countingDown);
  }

  handleCountingDown() {
    const { voteTimeout } = this.props;
    const countDown = voteTimeout - (Date.now() - this.startTime) / 1000;
    if (countDown <= 0) {
      return this.handleConfirmVote();
    }

    const progress = countDown / voteTimeout;
    const countDownNode = this.refs.countDown;
    countDownNode.innerHTML = Math.round(countDown);
    countDownNode.style.color = `rgb(${Math.round(255 * (1 - progress))}, ${Math.round(255 * progress)}, 0)`;
  }

  handleConfirmVote() {
    const { confirmVote, systemMessage } = this.props;
    const checked = ReactDOM.findDOMNode(this).querySelector('input:checked');
    const voteValue = checked ? checked.value : null;
    if (!voteValue) {
      systemMessage('warning', "你没有选择投票选项, 作弃权处理");
    }

    confirmVote(voteValue);
  }

  render() {
    const { voteOptions, voteTimeout } = this.props;

    return (
      <div className="vote-pane" style={this.style}>
        <span className="count-down" ref="countDown">{voteTimeout}</span>
        {voteOptions.map((option, index) => (
          <span className="vote-option">
            <input type="radio" ref={`vote${index}`} name="voteOption" value={option[0]}/>
            <span className="option-text">{option[1]}</span>
          </span>
        ))}
        <button className="confirm-vote" onClick={this.handleConfirmVote.bind(this)}>确认</button>
      </div>
    );
  }
}

VotePane.propTypes = {
  voteOptions: PropTypes.array,
  voteTimeout: PropTypes.number,
  confirmVote: PropTypes.func,
  systemMessage: PropTypes.func,
};
