import update from 'react-addons-update';
import { combineReducers } from 'redux';
import {
  RECEIVE_GAME_OBJECT_META,
  REMOVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
  RECEIVE_DECKS,
  RECEIVE_PLAYER_AREAS,
  SELECT_GAME_OBJECT,
  FLIP_GAME_OBJECTS,
  ROTATE_GAME_OBJECTS,
  DRAG_GAME_OBJECTS,
  DROP_GAME_OBJECTS,
  UNSELECT_GAME_OBJECTS,
  REMOVE_GAME_OBJECTS,
  START_DRAWING_GAME_OBJECT,
  END_DRAWING_GAME_OBJECT,
  REMOVE_PLAYER_AREA,
} from '../actions/action_types';
import camera from './camera';
import messages from './message';
import { arrayPlus, arrayMinus } from 'utils/array_enhancement';

function metaById(state = {}, action) {
  const updater = {};
  switch (action.type) {
  case RECEIVE_GAME_OBJECT_META:
    action.meta.forEach(metum => updater[metum.id] = { $set: metum });
    return update(state, updater);
  case REMOVE_GAME_OBJECT_META:
    action.metaIds.forEach(id => updater[id] = { $set: null });
    return update(state, updater);
  default:
    return state;
  }
}

function metaIds(state = [], action) {
  switch (action.type) {
  case RECEIVE_GAME_OBJECT_META:
    const newIds = action.meta.map(metum => metum.id);
    return arrayPlus(state, newIds);
  case REMOVE_GAME_OBJECT_META:
    return arrayMinus(state, action.metaIds);
  default:
    return state;
  }
}

const meta = combineReducers({
  byId: metaById,
  ids: metaIds,
});

function deckById(state = {}, action) {
  const updater = {};
  switch (action.type) {
  case RECEIVE_DECKS:
    action.decks.forEach(deck => updater[deck.id] = { $set: deck });
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

function playerAreaById(state = {}, action) {
  const updater = {};
  switch (action.type) {
  case RECEIVE_PLAYER_AREAS:
    action.playerAreas.forEach(playerArea => updater[playerArea.id] = { $set: playerArea });
    return update(state, updater);
  case REMOVE_PLAYER_AREA:
    updater[action.areaId] = { $set: null };
    return update(state, updater);
  default:
    return state;
  }
}

function playerAreaIds(state = [], action) {
  switch (action.type) {
  case RECEIVE_PLAYER_AREAS:
    const newIds = action.playerAreas.map(playerArea => playerArea.id);
    return arrayPlus(state, newIds);
  case REMOVE_PLAYER_AREA:
    return arrayMinus(state, [action.areaId]);
  default:
    return state;
  }
}

const playerAreas = combineReducers({
  byId: playerAreaById,
  ids: playerAreaIds,
});

function gameObjectById(state = {}, action) {
  const updater = {};
  switch (action.type) {
  case RECEIVE_GAME_OBJECTS:
    action.gameObjects.forEach(object => {
      const oldObject = state[object.id];
      if (!oldObject) {
        return updater[object.id] = { $set: object };
      }

      if (object.lock_version < oldObject.lock_version) {
        return;
      }

      updater[object.id] = {};
      Object.keys(object).forEach(key => updater[object.id][key] = { $set: object[key] });
    });
    return update(state, updater);
  case FLIP_GAME_OBJECTS:
    const singleUpdater = { is_fliped: { $set: action.isFlipped } };
    action.gameObjectIds.forEach(id => updater[id] = singleUpdater);
    return update(state, updater);
  case ROTATE_GAME_OBJECTS:
    action.gameObjectUpdates.forEach(object => {
      updater[object.id] = {
        rotate: { $set: object.rotate },
        center_x: { $set: object.center_x },
        center_y: { $set: object.center_y },
      }
    });
    return update(state, updater);
  case DRAG_GAME_OBJECTS:
    action.gameObjectIds.forEach(id => updater[id] = {
      isDragging: { $set: true },
      container_id: { $set: null },
      container_type: { $set: null },
    });
    return update(state, updater);
  case DROP_GAME_OBJECTS:
    action.gameObjects.forEach(object => {
      updater[object.id] = {
        center_x: { $set: object.center_x },
        center_y: { $set: object.center_y },
        isDragging: { $set: false },
      };
    });
    return update(state, updater);
  case REMOVE_GAME_OBJECTS:
    action.gameObjectIds.forEach(id => updater[id] = { $set: undefined });
    return update(state, updater);
  case SELECT_GAME_OBJECT:
    updater[action.gameObjectId] = {
      is_locked: { $set: true },
      player_num: { $set: action.playerNum },
    };
    return update(state, updater);
  case UNSELECT_GAME_OBJECTS:
    action.gameObjectIds.forEach(id => updater[id] = {
      is_locked: { $set: false },
      player_num: { $set: null },
    });
    return update(state, updater);
  case START_DRAWING_GAME_OBJECT:
    const template = Object.assign({}, state[action.templateId], {
      id: 'fakeDragging',
      isDragging: true,
      container_id: null,
      container_type: null,
    });
    updater['fakeDragging'] = { $set: template };
    updater[action.deckObjectId] = {
      player_num: { $set: null },
      container_id: { $set: null },
      container_type: { $set: null },
    };
    return update(state, updater);
  case END_DRAWING_GAME_OBJECT:
    const object = action.gameObject;
    updater[object.id] = { $set: object };
    updater['fakeDragging'] = { $set: null };
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
  case START_DRAWING_GAME_OBJECT:
    return arrayPlus(state, ['fakeDragging']);
  case END_DRAWING_GAME_OBJECT:
    const newState = arrayPlus(state, [action.gameObject.id]);
    return arrayMinus(newState, ['fakeDragging']);
  default:
    return state;
  }
}

function selectedIds(state = [], action) {
  switch (action.type) {
  case SELECT_GAME_OBJECT:
    return arrayPlus(state, [action.gameObjectId]);
  case UNSELECT_GAME_OBJECTS:
  case REMOVE_GAME_OBJECTS:
    return arrayMinus(state, action.gameObjectIds);
  case START_DRAWING_GAME_OBJECT:
    return arrayPlus(arrayMinus(state, [action.deckObjectId]), ['fakeDragging']);
  case END_DRAWING_GAME_OBJECT:
    return arrayMinus(arrayPlus(state, [action.gameObject.id]), ['fakeDragging']);
  default:
    return state;
  }
}

function isDragging(state = false, action) {
  switch (action.type) {
  case DRAG_GAME_OBJECTS:
  case START_DRAWING_GAME_OBJECT:
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
  playerAreas,
  messages,
});
