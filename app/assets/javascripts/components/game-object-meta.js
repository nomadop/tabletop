import React, { Component, PropTypes } from 'react';

export default class GameObjectMeta extends Component {
  constructor() {
    super(...arguments);

    this.state = { isSelected: false };
  }

  get className() {
    const classNames = ['game-object-meta'];
    if (this.state.isSelected) {
      classNames.push('selected');
    }

    return classNames.join(' ');
  }

  handleClick() {
    this.setState({
      isSelected: !this.state.isSelected,
    });
  }

  render() {
    const { meta, module } = this.props;

    return (
      <div className={this.className} onClick={this.handleClick.bind(this)}>
        <span><img className="thumb" src={`/res/${module}/${meta.front_img}`} alt={meta.front_img}/></span>
        <span className="name">{meta.name}</span>
        <span className="desc">{meta.description}</span>
      </div>
    );
  }
}

GameObjectMeta.propTypes = {
  meta: PropTypes.object,
  module: PropTypes.string,
};
