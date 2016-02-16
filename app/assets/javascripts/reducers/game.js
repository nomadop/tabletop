import update from 'react-addons-update';
import { combineReducers } from 'redux';
import {
  RECEIVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
  RECEIVE_DECKS,
  SELECT_GAME_OBJECT,
  FLIP_GAME_OBJECT,
  ROTATE_GAME_OBJECT,
  DRAG_GAME_OBJECTS,
  DROP_GAME_OBJECTS,
  UNSELECT_GAME_OBJECTS,
  REMOVE_GAME_OBJECTS,
} from '../actions/action_types';
import camera from './camera';
import { arrayPlus, arrayMinus } from 'utils/array_enhancement';

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

function deckById(state = {}, action) {
  const updater = {};
  switch (action.type) {
  case RECEIVE_DECKS:
    action.decks.forEach(deck => updater[deck.id] = {$set: deck});
    return update(state, updater);
  default:
    return state;
  }
}

function deckIds(state = [], action) {
  switch (action.type) {
  case RECEIVE_DECKS:
    const newIds = action.decks.map(deck => deck.id);
    return arrayPlus(state, newIds);
  default:
    return state;
  }
}

const decks = combineReducers({
  byId: deckById,
  ids: deckIds,
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
  case DROP_GAME_OBJECTS:
    action.gameObjects.forEach(object => {
      updater[object.id] = {
        center_x: {$set: object.center_x},
        center_y: {$set: object.center_y},
      };
    });
    return update(state, updater);
  case REMOVE_GAME_OBJECTS:
    action.gameObjectIds.forEach(id => updater[id] = {$set: undefined});
    return update(state, updater);
  default:
    return state;
  }
}

function gameObjectIds(state = [], action) {
  switch (action.type) {
  case RECEIVE_GAME_OBJECTS:
    const newIds = action.gameObjects.map(gameObjects => gameObjects.id);
    return arrayPlus(state, newIds);
  case REMOVE_GAME_OBJECTS:
    return arrayMinus(state, action.gameObjectIds);
  default:
    return state;
  }
}

function selectedIds(state = [], action) {
  const newState = state.slice();
  switch (action.type) {
  case SELECT_GAME_OBJECT:
    newState.push(action.gameObjectId);
    return newState;
  case UNSELECT_GAME_OBJECTS:
  case REMOVE_GAME_OBJECTS:
    return arrayMinus(newState, action.gameObjectIds);
  default:
    return state;
  }
}

function isDragging(state = false, action) {
  switch (action.type) {
  case DRAG_GAME_OBJECTS:
    return true;
  case DROP_GAME_OBJECTS:
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
  decks,
  camera,
  gameObjects,
});
