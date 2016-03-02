import { createSelector } from 'reselect';

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
  playerAreaByIdSelector,
  playerAreaIdsSelector,
  (playerAreaById, playerAreaIds) => playerAreaIds.map(id => playerAreaById[id])
);

const gameObjectsSelector = createSelector(
  metaByIdSelector,
  deckByIdSelector,
  deckIdsSelector,
  gameObjectByIdSelector,
  gameObjectIdsSelector,
  (metaById, deckById, deckIds, gameObjectById, gameObjectIds) => {
    deckIds.forEach(id => deckById[id].innerObjects = []);
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
  (camera, meta, selectedIds) => {
    return { camera, meta, selectedIds };
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