import { combineReducers } from 'redux';
import authentication from './authentication';
import camera from './camera';

export default combineReducers({
  authentication,
  camera,
});
