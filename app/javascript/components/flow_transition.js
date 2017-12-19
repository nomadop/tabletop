import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from '../utils/class_names';
import { FLOW_OBJECT_SIZE } from '../constants/misc';

export default class FlowTransition extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  get style() {
    const { from, to } = this.props;
    const [from_x, from_y] = [from.center_x, from.center_y];
    const [to_x, to_y] = [to.center_x, to.center_y];
    let top = Math.min(from_y, to_y);
    let left = Math.min(from_x, to_x);
    let width = Math.abs(from_x - to_x);
    let height = Math.abs(from_y - to_y);

    if (width > FLOW_OBJECT_SIZE) {
      width -= FLOW_OBJECT_SIZE;
      left += FLOW_OBJECT_SIZE / 2;
    } else {
      height -= FLOW_OBJECT_SIZE;
      top += FLOW_OBJECT_SIZE / 2;
    }

    const result = {
      top,
      left,
      width,
      height,
    };

    return result;
  }

  render() {
    const { from, to } = this.props;
    const [from_x, from_y] = [from.center_x, from.center_y];
    const [to_x, to_y] = [to.center_x, to.center_y];
    let direction;
    if (from_x <= to_x && from_y <= to_y) {
      direction = 'right-down';
    } else if (from_x > to_x && from_y <= to_y) {
      direction = 'left-down';
    } else if (from_x <= to_x && from_y > to_y) {
      direction = 'right-up';
    } else {
      direction = 'left-up';
    }

    if (Math.abs(from_x - to_x) < FLOW_OBJECT_SIZE) {
      direction += ' vertical';
    } else {
      direction += ' horizontal';
    }

    return (
      <div className={classNames('flow-transaction-box', direction)} style={this.style}>
        <div className="top-left"></div>
        <div className="top-right"></div>
        <div className="bottom-left"></div>
        <div className="bottom-right"></div>
        <div className="direction-arrow"></div>
      </div>
    );
  }
}

FlowTransition.propTypes = {
  from: PropTypes.object,
  to: PropTypes.object,
};
