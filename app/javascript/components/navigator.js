import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Navigator extends Component {
  render() {
    return (
      <nav className="navigator">
        {this.props.children}
      </nav>
    );
  }
}

Navigator.propTypes = {
  children: PropTypes.array,
};
