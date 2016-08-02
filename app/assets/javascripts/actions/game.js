import fetch from 'isomorphic-fetch';
import {
  RECEIVE_GAME_OBJECT_META,
  RECEIVE_GAME_OBJECTS,
  RECEIVE_DECKS,
  RECEIVE_PLAYER_AREAS,
  RECEIVE_PLAYERS,
  RECEIVE_GAME_FLOWS,
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
  REMOVE_GAME_OBJECT_META,
  TOGGLE_CREATE_META_PANE,
  TOGGLE_CREATE_OBJECT_PANE,
  TOGGLE_EDIT_OBJECT_PANE,
  TOGGLE_GAME_MENU,
  TOGGLE_PLAYER_PANE,
  START_VOTE,
  END_VOTE,
  CLEAR_MESSAGES,
} from '../constants/action_types';
import { receiveMessages } from './message';

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

export function removeGameObjectMeta(metaIds) {
  return {
    type: REMOVE_GAME_OBJECT_META,
    metaIds,
  };
}

export function receiveDecks(decks) {
  return {
    type: RECEIVE_DECKS,
    decks,
  };
}

export function receivePlayerAreas(playerAreas) {
  return {
    type: RECEIVE_PLAYER_AREAS,
    playerAreas,
  };
}

export function receivePlayers(players) {
  return {
    type: RECEIVE_PLAYERS,
    players,
  };
}

export function receiveGameFlows(gameFlows) {
  return {
    type: RECEIVE_GAME_FLOWS,
    gameFlows,
  };
}

export function fetchGameData(roomId) {
  return (dispatch) => {
    fetch(`/rooms/${roomId}/game_data`, {
      credentials: 'same-origin',
    }).then(response => response.json())
      .then(json => {
        dispatch(receiveGameObjectMeta(json.game_object_meta));
        dispatch(receiveDecks(json.decks));
        dispatch(receivePlayerAreas(json.player_areas));
        dispatch(receiveGameFlows(json.game_flows));
        dispatch(receiveGameObjects(json.game_objects));
        dispatch(receiveMessages(json.messages));
        dispatch(receivePlayers(json.players));
      });
  };
}

export function selectGameObject(playerNum, gameObjectId) {
  return {
    type: SELECT_GAME_OBJECT,
    gameObjectId,
    playerNum,
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

export function removePlayerArea(areaId) {
  return {
    type: REMOVE_PLAYER_AREA,
    areaId,
  };
}

export function toggleGameMenu(isShown) {
  return {
    type: TOGGLE_GAME_MENU,
    isShown,
  };
}

export function toggleCreateObjectPane(isShown) {
  return {
    type: TOGGLE_CREATE_OBJECT_PANE,
    isShown,
  };
}

export function toggleEditObjectPane(gameObjectId, isShown) {
  return {
    type: TOGGLE_EDIT_OBJECT_PANE,
    gameObjectId,
    isShown,
  };
}

export function toggleCreateMetaPane(isShown) {
  return {
    type: TOGGLE_CREATE_META_PANE,
    isShown,
  };
}

export function togglePlayerPane(isShown) {
  return {
    type: TOGGLE_PLAYER_PANE,
    isShown,
  };
}

export function startVote(options, timeout) {
  return {
    type: START_VOTE,
    options,
    timeout,
  };
}

export function endVote() {
  return {
    type: END_VOTE,
  };
}

export function clearMessages() {
  return {
    type: CLEAR_MESSAGES,
  };
}
