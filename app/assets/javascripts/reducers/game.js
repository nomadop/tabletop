import { combineReducers } from 'redux';
import {
  RECEIVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
  SELECT_GAME_OBJECT,
  FLIP_GAME_OBJECT,
  ROTATE_GAME_OBJECT,
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
  const newState = Object.assign({}, state);
  switch (action.type) {
  case RECEIVE_GAME_OBJECTS:
    return action.gameObjects.reduce((result, gameObjects) => {
      result[gameObjects.id] = gameObjects;
      return result;
    }, {});
  case FLIP_GAME_OBJECT:
    const isFliped = newState[action.gameObjectId].is_fliped;
    newState[action.gameObjectId].is_fliped = !isFliped;
    return newState;
  case ROTATE_GAME_OBJECT:
    newState[action.gameObjectId].rotate += action.offset;
    return newState;
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

const gameObjects = combineReducers({
  byId: gameObjectById,
  ids: gameObjectIds,
  selectedIds,
});

export default combineReducers({
  meta,
  camera,
  gameObjects,
});
