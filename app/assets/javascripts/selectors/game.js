import { createSelector } from 'reselect';
import messagesSelector from './message';

const authenticationSelector = (state, props) => props.authentication;
const cameraSelector = state => state.camera;
const metaByIdSelector = state => state.meta.byId;
const metaIdsSelector = state => state.meta.ids;
const deckByIdSelector = state => state.decks.byId;
const deckIdsSelector = state => state.decks.ids;
const playerAreaByIdSelector = state => state.playerAreas.byId;
const playerAreaIdsSelector = state => state.playerAreas.ids;
const gameObjectByIdSelector = state => state.gameObjects.byId;
const gameObjectIdsSelector = state => state.gameObjects.ids;
const isDraggingSelector = state => state.gameObjects.isDragging;

const metaSelector = createSelector(
  metaByIdSelector,
  metaIdsSelector,
  (metaById, metaIds) => metaIds.map(id => metaById[id])
);

const playerAreasSelector = createSelector(
  authenticationSelector,
  playerAreaByIdSelector,
  playerAreaIdsSelector,
  (authentication, playerAreaById, playerAreaIds) => playerAreaIds.map(id => {
    const area = playerAreaById[id];
    area.isOwner = area.player_num === authentication.player_num;
    return area;
  })
);

const gameObjectsSelector = createSelector(
  metaByIdSelector,
  deckByIdSelector,
  deckIdsSelector,
  playerAreaByIdSelector,
  playerAreaIdsSelector,
  gameObjectByIdSelector,
  gameObjectIdsSelector,
  (metaById, deckById, deckIds, areaById, areaIds, gameObjectById, gameObjectIds) => {
    deckIds.forEach(id => deckById[id].innerObjects = []);
    areaIds.forEach(id => areaById[id].innerObjects = []);
    return gameObjectIds.map(id => {
      const object = gameObjectById[id];
      if (object.meta_type === 'Deck') {
        object.meta = deckById[object.meta_id];
      } else {
        object.meta = metaById[object.meta_id];
      }

      if (object.container_type === 'Deck') {
        const deck = deckById[object.container_id];
        deck.innerObjects.push(object);
        object.container = deck;
      } else if (object.container_type === 'PlayerArea') {
        const area = areaById[object.container_id];
        area.innerObjects.push(object);
        object.container = area;
      } else {
        object.container = null;
      }

      return object;
    });
  }
);

const selectedIdsSelector = createSelector(
  authenticationSelector,
  gameObjectByIdSelector,
  (authentication, gameObjectById) => {
    const ids = [];
    Object.values(gameObjectById).forEach(object => {
      if (object && object.is_locked && object.player_num === authentication.player_num) {
        ids.push(object.id);
      }
    });
    return ids;
  }
);

const selectedObjectsSelector = createSelector(
  gameObjectByIdSelector,
  selectedIdsSelector,
  (gameObjectById, selectedIds) => selectedIds.map(id => gameObjectById[id])
);

export const gameContainerSelector = createSelector(
  cameraSelector,
  metaSelector,
  selectedIdsSelector,
  isDraggingSelector,
  messagesSelector,
  gameObjectsSelector,
  selectedObjectsSelector,
  (camera, meta, selectedIds, isDragging, messages, gameObjects, selectedObjects) => {
    return { camera, meta, selectedIds, isDragging, messages, gameObjects, selectedObjects };
  }
);

export const gameObjectContainerSelector = createSelector(
  playerAreasSelector,
  gameObjectsSelector,
  selectedIdsSelector,
  selectedObjectsSelector,
  isDraggingSelector,
  (playerAreas, gameObjects, selectedIds, selectedObjects, isDragging) => {
    return { playerAreas, gameObjects, selectedIds, selectedObjects, isDragging };
  }
);