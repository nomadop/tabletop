import React, { Component, PropTypes } from 'react';
import GamePane from './game_pane';

export default class EditObjectPane extends Component {
  render() {
    const { gameObject } = this.props;
    return (
      <GamePane className="edit-object-pane"
                title={`编辑${gameObject.meta.name}`}
                width={385} height={550}
                onClose={this.props.onClose}
      >
      </GamePane>
    );
  }
}

EditObjectPane.propTypes = {
  gameObject: PropTypes.object,
  onClose: PropTypes.func,
  systemWarning: PropTypes.func,
};
