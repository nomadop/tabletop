import update from 'react-addons-update';
import { combineReducers } from 'redux';
import {
  RECEIVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
  SELECT_GAME_OBJECT,
  FLIP_GAME_OBJECT,
  ROTATE_GAME_OBJECT,
  DRAG_GAME_OBJECT,
  DROP_GAME_OBJECT,
  UNSELECT_GAME_OBJECTS,
} from '../actions/action_types';
import camera from './camera';
import arrayMinus from '../utils/array_minus';

function metaById(state = {}, action) {
  if (action.type === RECEIVE_GAME_OBJECT_META) {
    return action.meta.reduce((result, meta) => {
      result[meta.id] = meta;
      return result;
    }, {});
  }

  return state;
}

function metaIds(state = [], action) {
  if (action.type === RECEIVE_GAME_OBJECT_META) {
    return action.meta.map(meta => meta.id);
  }

  return state;
}

const meta = combineReducers({
  byId: metaById,
  ids: metaIds,
});

function gameObjectById(state = {}, action) {
  const updater = {};
  switch (action.type) {
  case RECEIVE_GAME_OBJECTS:
    action.gameObjects.forEach(object => updater[object.id] = {$set: object});
    return update(state, updater);
  case FLIP_GAME_OBJECT:
    updater[action.gameObjectId] = {is_fliped: {$set: action.isFlipped}};
    return update(state, updater);
  case ROTATE_GAME_OBJECT:
    updater[action.gameObjectId] = {rotate: {$set: action.rotate}};
    return update(state, updater);
  case DROP_GAME_OBJECT:
    updater[action.gameObjectId] = {
      center_x: {$set: action.centerX},
      center_y: {$set: action.centerY},
    };
    return update(state, updater);
  default:
    return state;
  }
}

function gameObjectIds(state = [], action) {
  if (action.type === RECEIVE_GAME_OBJECTS) {
    return action.gameObjects.map(gameObjects => gameObjects.id);
  }

  return state;
}

function selectedIds(state = [], action) {
  const newState = state.slice();
  switch (action.type) {
  case SELECT_GAME_OBJECT:
    newState.push(action.gameObjectId);
    return newState;
  case UNSELECT_GAME_OBJECTS:
    return arrayMinus(newState, action.gameObjectIds);
  default:
    return state;
  }
}

function isDragging(state = false, action) {
  switch (action.type) {
  case DRAG_GAME_OBJECT:
    return true;
  case DROP_GAME_OBJECT:
    return false;
  default:
    return state;
  }
}

const gameObjects = combineReducers({
  byId: gameObjectById,
  ids: gameObjectIds,
  selectedIds,
  isDragging,
});

export default combineReducers({
  meta,
  camera,
  gameObjects,
});
