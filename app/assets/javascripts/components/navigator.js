import React, { Component, PropTypes } from 'react';

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
