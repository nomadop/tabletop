import update from 'react-addons-update';
import { combineReducers } from 'redux';
import { RECEIVE_MESSAGES, CLEAR_MESSAGES } from '../constants/action_types';
import { arrayPlus, arrayMinus } from 'utils/array_enhancement';

function messageById(state = {}, action) {
  const updater = {};
  switch (action.type) {
  case RECEIVE_MESSAGES:
    action.messages.forEach(message => updater[message.id] = { $set: message });
    return update(state, updater);
  case CLEAR_MESSAGES:
    return {};
  default:
    return state;
  }
}

function messageIds(state = [], action) {
  switch (action.type) {
  case RECEIVE_MESSAGES:
    const newIds = action.messages.map(message => message.id);
    return arrayPlus(state, newIds);
  case CLEAR_MESSAGES:
    return [];
  default:
    return state;
  }
}

export default combineReducers({
  byId: messageById,
  ids: messageIds,
});