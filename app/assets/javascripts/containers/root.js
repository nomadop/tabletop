import 'babel-polyfill';
import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import appReducers from '../reducers/index';
import appContainers from '../containers/index';

const logger = createLogger({ collapsed: true });

const middlewares = [thunk];

export default class Root extends Component {
  componentWillMount() {
    const appReducer = appReducers[this.props.app];
    if (this.props.debug) {
      middlewares.push(logger);
    }

    const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
    this.store = createStoreWithMiddleware(appReducer);
  }

  renderAppComponent() {
    return React.createElement(appContainers[this.props.app], this.props);
  }

  render() {
    return (
      <Provider store={this.store}>
        {this.renderAppComponent()}
      </Provider>
    );
  }
}

Root.propTypes = {
  app: PropTypes.string.isRequired,
};
