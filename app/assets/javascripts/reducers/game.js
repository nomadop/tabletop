import { combineReducers } from 'redux';
import {
  RECEIVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
} from '../actions/action_types';
import camera from './camera';

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
  if (action.type === RECEIVE_GAME_OBJECTS) {
    return action.gameObjects.reduce((result, gameObjects) => {
      result[gameObjects.id] = gameObjects;
      return result;
    }, {});
  }

  return state;
}

function gameObjectIds(state = [], action) {
  if (action.type === RECEIVE_GAME_OBJECTS) {
    return action.gameObjects.map(gameObjects => gameObjects.id);
  }

  return state;
}

const gameObjects = combineReducers({
  byId: gameObjectById,
  ids: gameObjectIds,
});

export default combineReducers({
  meta,
  camera,
  gameObjects,
});
