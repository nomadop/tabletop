import React, { Component, PropTypes } from 'react';
import GamePane from './game_pane';

export default class CreateObjectPane extends Component {
  renderMeta() {
    const { meta, module, createGameObject } = this.props;
    return meta.map(metum => (
      <div className="game-object-meta" key={metum.id} onClick={createGameObject.bind(null, metum.id)}>
        <img className="thumb" src={`/res/${module}/${metum.front_img}`} alt={metum.front_img}/>
        <span className="name">{metum.name}</span>
        <span className="desc">{metum.description}</span>
      </div>
    ))
  }

  render() {
    return (
      <GamePane className="create-object-pane" title="Create Game Object" width={648} height={480} resizeable={true}>
        {this.renderMeta()}
      </GamePane>
    );
  }
}

CreateObjectPane.propTypes = {
  meta: PropTypes.array,
  module: PropTypes.string,
  createGameObject: PropTypes.func,
};
