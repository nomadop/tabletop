import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

export default class GameObjectMeta extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      isSelected: false,
      showDesc: false,
      descTop: 0,
      descLeft: 0,
    };
  }

  get descStyle() {
    const { showDesc, descTop, descLeft } = this.state;

    return {
      top: descTop,
      left: descLeft,
      display: showDesc ? 'block' : 'none',
    };
  }

  get className() {
    const classNames = ['game-object-meta'];
    if (this.state.isSelected) {
      classNames.push('selected');
    }

    return classNames.join(' ');
  }

  handleShowDesc(showDesc) {
    this.setState({showDesc});
  }

  handleMoveDesc(event) {
    const { clientX, clientY } = event.nativeEvent;
    this.setState({
      descTop: clientY,
      descLeft: clientX + 10,
    });
  }

  handleClick() {
    this.setState({
      isSelected: !this.state.isSelected,
    });
  }

  render() {
    const { meta } = this.props;
    const desc = meta.description;
    const descNode = desc && desc.length ? <span className="desc" style={this.descStyle}>{meta.description}</span> : null;

    return (
      <div className={this.className}
           onMouseOver={this.handleShowDesc.bind(this, true)}
           onMouseOut={this.handleShowDesc.bind(this, false)}
           onMouseMove={this.handleMoveDesc.bind(this)}
           onClick={this.handleClick.bind(this)}
      >
        <span><img className="thumb" src={`${meta.front_img.url}`}/></span>
        <span className="name">{meta.name}</span>
        {descNode}
      </div>
    );
  }
}

GameObjectMeta.propTypes = {
  meta: PropTypes.object,
};
