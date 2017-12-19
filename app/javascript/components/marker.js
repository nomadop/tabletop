import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from '../utils/class_names';

export default class Marker extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  componentDidMount() {
    const { marker } = this.props;
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

  renderContent() {
    const { marker } = this.props;

    switch (marker.marker_type) {
    case 'image':
      return <img src={marker.content.src}/>;
    case 'icon':
      return <i className={marker.content.class_name}/>;
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
