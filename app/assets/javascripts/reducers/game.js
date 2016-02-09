import { combineReducers } from 'redux';
import { RECEIVE_GAME_OBJECT_META } from '../actions/action_types';
import camera from './camera';

function meta(state = [], action) {
  switch (action.type) {
  case RECEIVE_GAME_OBJECT_META:
    return action.meta;
  default:
    return state;
  }
}

export default combineReducers({
  meta,
  camera,
});
