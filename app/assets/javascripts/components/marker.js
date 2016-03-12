import React, { Component, PropTypes } from 'react';
import classNames from '../utils/class_names';

export default class Marker extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
    if (this.props.marker.marker_type === 'text') {
      this.state.input = true;
      window.isKeyEventDisabled = true;
    }
  }

  componentDidMount() {
    const { marker } = this.props;
    if (marker.marker_type === 'text') {
      this.refs.text.focus();
    }
  }

  get style() {
    const { marker } = this.props;
    const { marker_type, top, left, rotate, scale, content } = marker;
    const transform = `scale(${scale}, ${scale}) rotate(${rotate}deg)`;
    const result = {
      top,
      left,
      transform,
    };

    return result;
  }

  handleChangeText(event) {
    const input = event.target;
    const { update } = this.props;
    update({
      content: { text: { $set: input.value } },
    });
  }

  handleFinishInput() {
    window.isKeyEventDisabled = false;
    this.setState({ input: false });
  }


  renderText() {
    const { marker } = this.props;
    const { input } = this.state;
    const text = marker.content.text;
    if (input) {
      return (
        <input type="text" ref="text" value={text}
               onChange={this.handleChangeText.bind(this)}
               onBlur={this.handleFinishInput.bind(this)}
        />
      );
    } else {
      return text;
    }
  }

  renderContent() {
    const { marker } = this.props;

    switch (marker.marker_type) {
    case 'text':
      return this.renderText();
    }
  }

  render() {
    const { editMode } = this.props;
    return (
      <span className={classNames('marker', {edit: editMode})} tabIndex={editMode ? '1' : false} style={this.style}>
        {this.renderContent()}
      </span>
    );
  }
}

Marker.propTypes = {
  marker: PropTypes.object,
  editMode: PropTypes.bool,
  update: PropTypes.func,
};
