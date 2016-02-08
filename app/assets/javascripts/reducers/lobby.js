import { combineReducers } from 'redux';
import { NEW_MESSAGE } from '../actions/action_types';

function messages(state = [], action) {
  const newState = state.slice();
  switch (action.type) {
  case NEW_MESSAGE:
    newState.push(action.message);
    return newState;
  default:
    return state;
  }
}

export default combineReducers({
  messages,
});
