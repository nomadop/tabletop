import fetch from 'isomorphic-fetch';
import { RECEIVE_GAME_OBJECT_META } from './action_types';

export function receiveGameObjectMeta(meta) {
  return {
    type: RECEIVE_GAME_OBJECT_META,
    meta,
  };
}

export function fetchGameObjectMeta(gameId) {
  return (dispatch) => {
    fetch(`/games/${gameId}/meta`)
      .then(response => response.json())
      .then(json => dispatch(receiveGameObjectMeta(json)));
  };
}