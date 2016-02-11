import fetch from 'isomorphic-fetch';
import {
  RECEIVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
  SELECT_GAME_OBJECT,
  UNSELECT_GAME_OBJECTS,
} from './action_types';

export function receiveGameObjects(gameObjects) {
  return {
    type: RECEIVE_GAME_OBJECTS,
    gameObjects,
  };
}

export function receiveGameObjectMeta(meta) {
  return {
    type: RECEIVE_GAME_OBJECT_META,
    meta,
  };
}

export function fetchGameData(gameId) {
  return (dispatch) => {
    fetch(`/games/${gameId}/game_data`)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveGameObjectMeta(json.game_object_meta));
        dispatch(receiveGameObjects(json.game_objects));
      });
  };
}

export function selectGameObject(gameObjectId) {
  return {
    type: SELECT_GAME_OBJECT,
    gameObjectId,
  };
}

export function unselectGameObjects(gameObjectIds) {
  return {
    type: UNSELECT_GAME_OBJECTS,
    gameObjectIds,
  };
}
