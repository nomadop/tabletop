import React, { Component, PropTypes } from 'react';
import GameObjectMeta from './game-object-meta';
import GamePane from './game_pane';

export default class CreateObjectPane extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      filter: 'All',
    };
  }

  get metaComponents() {
    return Object.values(this.refs);
  }

  handleSetFilter(filter) {
    this.setState({ filter });
  }

  handleSelectAll(isSelected) {
    this.metaComponents.forEach(component => component.setState({ isSelected }));
  }

  handleCreateSelected() {
    const selectedComponents = this.metaComponents.filter(component => component.state.isSelected);
    const metaIds = selectedComponents.map(component => component.props.meta.id);
    App.game.create_game_objects(metaIds);
  }

  handleCreateDeck() {
    const selectedComponents = this.metaComponents.filter(component => component.state.isSelected);
    const metaIds = selectedComponents.map(component => component.props.meta.id);
    App.game.create_and_pack_game_objects(metaIds);
  }

  renderMeta() {
    const { meta, module } = this.props;
    const filter = this.state.filter;
    const filteredMeta = meta.filter(metum => filter === 'All' ? true : metum.sub_type === filter);
    return filteredMeta.map(metum => <GameObjectMeta key={metum.id} ref={`meta${metum.id}`} meta={metum} module={module}/>);
  }

  renderFilterTabs() {
    const filter = this.state.filter;
    const tabs = ['All'];
    this.props.meta.forEach(metum => {
      const subType = metum.sub_type;
      if (tabs.indexOf(subType) < 0) {
        tabs.push(subType);
      }
    });

    const getClassName = (tab) => `filter-tab${tab === filter ? ' active' : ''}`;
    return tabs.map(tab => <span key={tab} className={getClassName(tab)} onClick={this.handleSetFilter.bind(this, tab)}>{tab}</span>);
  }

  renderFooterControl() {
    return (
      <div className="footer-control">
        <button onClick={this.handleSelectAll.bind(this, true)}>Select All</button>
        <button onClick={this.handleCreateSelected.bind(this)}>Create</button>
        <button onClick={this.handleCreateDeck.bind(this)}>Create Deck</button>
      </div>
    )
  }

  render() {
    return (
      <GamePane className="create-object-pane" title="Create Game Object" width={360} height={480} resizeable={true}>
        <div className="filter-bar">
          {this.renderFilterTabs()}
          <span className="filter-fill"/>
        </div>
        <div className="meta-container">
          {this.renderMeta()}
        </div>
        {this.renderFooterControl()}
      </GamePane>
    );
  }
}

CreateObjectPane.propTypes = {
  meta: PropTypes.array,
  module: PropTypes.string,
};
