import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class VotePane extends Component {
  componentDidMount() {
    const { voteTimeout } = this.props;
    this.timeout = setTimeout(this.handleConfirmVote.bind(this), voteTimeout * 1000);
  }

  handleConfirmVote() {
    clearTimeout(this.timeout);
    const { confirmVote, systemMessage } = this.props;
    const checked = ReactDOM.findDOMNode(this).querySelector('input:checked');
    const voteValue = checked ? checked.value : null;
    if (!voteValue) {
      systemMessage('warning', "你没有选择投票选项, 作弃权处理");
    }
    confirmVote(voteValue);
  }

  render() {
    const { voteOptions } = this.props;

    return (
      <div className="vote-pane" style={this.style}>
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
