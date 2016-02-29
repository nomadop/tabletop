import fetch from 'isomorphic-fetch';
import {
  RECEIVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
  RECEIVE_DECKS,
  SELECT_GAME_OBJECT,
  FLIP_GAME_OBJECTS,
  ROTATE_GAME_OBJECTS,
  DRAG_GAME_OBJECTS,
  DROP_GAME_OBJECTS,
  UNSELECT_GAME_OBJECTS,
  REMOVE_GAME_OBJECTS,
  START_DRAWING_GAME_OBJECT,
  END_DRAWING_GAME_OBJECT,
  EXPAND_DECK,
  COLLAPSE_DECK,
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

export function receiveDecks(decks) {
  return {
    type: RECEIVE_DECKS,
    decks,
  };
}

export function fetchGameData(gameId) {
  return (dispatch) => {
    fetch(`/games/${gameId}/game_data`)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveGameObjectMeta(json.game_object_meta));
        dispatch(receiveDecks(json.decks));
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

export function flipGameObjects(gameObjectIds, isFlipped) {
  return {
    type: FLIP_GAME_OBJECTS,
    gameObjectIds,
    isFlipped,
  };
}

export function rotateGameObjects(gameObjectUpdates) {
  return {
    type: ROTATE_GAME_OBJECTS,
    gameObjectUpdates,
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

export function removeGameObjects(gameObjectIds) {
  return {
    type: REMOVE_GAME_OBJECTS,
    gameObjectIds,
  };
}

export function startDrawingGameObject(deckObjectId, templateId) {
  return {
    type: START_DRAWING_GAME_OBJECT,
    deckObjectId,
    templateId,
  };
}

export function endDrawingGameObject(gameObject) {
  return {
    type: END_DRAWING_GAME_OBJECT,
    gameObject,
  };
}
