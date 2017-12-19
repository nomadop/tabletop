import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GameObjectMeta from './game-object-meta';
import GamePane from './game_pane';

export default class CreateObjectPane extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      filter: '所有',
    };
  }

  get metaComponents() {
    return Object.values(this.refs);
  }

  handleSetFilter(filter) {
    this.handleSelectAll(false);
    this.setState({ filter });
  }

  handleSelectAll(isSelected) {
    this.metaComponents.forEach(component => component.setState({ isSelected }));
  }

  handleCreateSelected(pack) {
    const selectedComponents = this.metaComponents.filter(component => component.state.isSelected);
    const metaIds = selectedComponents.map(component => component.props.meta.id);

    if (metaIds.length) {
      if (confirm('确定创建选定的物件?')) {
        pack ? App.game.create_and_pack_game_objects(metaIds) : App.game.create_game_objects(metaIds);
      }
    } else {
      this.props.systemWarning('没有选择物件.');
    }
  }

  handleDestroySelectedMeta() {
    const selectedComponents = this.metaComponents.filter(component => component.state.isSelected);
    const metaIds = selectedComponents.map(component => component.props.meta.id);

    if (metaIds.length) {
      if (confirm('确定移除选定的元物件?')) {
        App.game.destroy_meta(metaIds);
      }
    } else {
      this.props.systemWarning('没有选择物件.');
    }
  }

  renderMeta() {
    const { meta } = this.props;
    const filter = this.state.filter;
    const filteredMeta = meta.filter(metum => filter === '所有' ? true : metum.sub_type === filter);
    return filteredMeta.map(metum => <GameObjectMeta key={metum.id} ref={`meta${metum.id}`} meta={metum}/>);
  }

  renderFilterTabs() {
    const filter = this.state.filter;
    const tabs = ['所有'];
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
    const devMode = this.props.devMode;
    return (
      <div className="footer-control">
        <button onClick={this.handleSelectAll.bind(this, true)}>全选</button>
        <button onClick={this.handleSelectAll.bind(this, false)}>取消全选</button>
        { devMode ? <button onClick={this.handleDestroySelectedMeta.bind(this)}>移除</button> : null }
        <button onClick={this.handleCreateSelected.bind(this, false)}>创建</button>
        <button onClick={this.handleCreateSelected.bind(this, true)}>创建并打包</button>
      </div>
    )
  }

  render() {
    return (
      <GamePane className="create-object-pane"
                title="创建新物件"
                width={385} height={550}
                resizeable={true}
                onClose={this.props.onClose}
      >
        <div className="filter-bar">
          {this.renderFilterTabs()}
          <span className="filter-fill"/>
        </div>
        <div className="meta-container">
          <div className="content">{this.renderMeta()}</div>
        </div>
        {this.renderFooterControl()}
      </GamePane>
    );
  }
}

CreateObjectPane.propTypes = {
  meta: PropTypes.array,
  devMode: PropTypes.bool,
  onClose: PropTypes.func,
  systemWarning: PropTypes.func,
};
