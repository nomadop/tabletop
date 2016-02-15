import fetch from 'isomorphic-fetch';
import {
  RECEIVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
  SELECT_GAME_OBJECT,
  FLIP_GAME_OBJECT,
  ROTATE_GAME_OBJECT,
  DRAG_GAME_OBJECTS,
  DROP_GAME_OBJECTS,
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

export function flipGameObject(gameObjectId, isFlipped) {
  return {
    type: FLIP_GAME_OBJECT,
    gameObjectId,
    isFlipped,
  };
}

export function rotateGameObject(gameObjectId, rotate) {
  return {
    type: ROTATE_GAME_OBJECT,
    gameObjectId,
    rotate,
  };
}

export function dragGameObjects(gameObjectIds) {
  return {
    type: DRAG_GAME_OBJECTS,
    gameObjectIds,
  };
}

export function dropGameObjects(gameObjects) {
  return {
    type: DROP_GAME_OBJECTS,
    gameObjects,
  };
}
