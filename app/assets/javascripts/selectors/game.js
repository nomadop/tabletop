import { createSelector } from 'reselect';
import messagesSelector from './message';

const authenticationSelector = (state, props) => props.authentication;
const cameraSelector = state => state.camera;
const metaByIdSelector = state => state.meta.byId;
const metaIdsSelector = state => state.meta.ids;
const deckByIdSelector = state => state.decks.byId;
const deckIdsSelector = state => state.decks.ids;
const gameFlowByIdSelector = state => state.gameFlows.byId;
const gameFlowIdsSelector = state => state.gameFlows.ids;
const playerAreaByIdSelector = state => state.playerAreas.byId;
const playerAreaIdsSelector = state => state.playerAreas.ids;
const gameObjectByIdSelector = state => state.gameObjects.byId;
const gameObjectIdsSelector = state => state.gameObjects.ids;
const isDraggingSelector = state => state.gameObjects.isDragging;
const showGameMenuSelector = state => state.gamePanes.showGameMenu;
const showCreateObjectPaneSelector = state => state.gamePanes.showCreateObjectPane;
const showCreateMetaPaneSelector = state => state.gamePanes.showCreateMetaPane;
const showPlayerPaneSelector = state => state.gamePanes.showPlayerPane;
const editObjectPaneIdsSelector = state => state.gamePanes.editObjectPaneIds;
const votePaneSelector = state => state.gamePanes.votePane;
const playersSelector = state => state.players;

const editObjectPanesSelector = createSelector(
  gameObjectByIdSelector,
  editObjectPaneIdsSelector,
  (gameObjectById, gameObjectIds) => gameObjectIds.map(id => gameObjectById[id])
);

const gamePanesSelector = createSelector(
  showGameMenuSelector,
  showCreateMetaPaneSelector,
  showCreateObjectPaneSelector,
  showPlayerPaneSelector,
  editObjectPanesSelector,
  votePaneSelector,
  (showGameMenu, showCreateMetaPane, showCreateObjectPane, showPlayerPane, editObjectPanes, votePane) => {
    return { showGameMenu, showCreateMetaPane, showCreateObjectPane, showPlayerPane, editObjectPanes, votePane };
  }
);

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
  gameFlowByIdSelector,
  gameFlowIdsSelector,
  playerAreaByIdSelector,
  playerAreaIdsSelector,
  gameObjectByIdSelector,
  gameObjectIdsSelector,
  (metaById, deckById, deckIds, gameFlowById, gameFlowIds, areaById, areaIds, gameObjectById, gameObjectIds) => {
    deckIds.forEach(id => deckById[id].innerObjects = []);
    areaIds.forEach(id => areaById[id].innerObjects = []);
    return gameObjectIds.map(id => {
      const object = gameObjectById[id];
      switch (object.meta_type) {
      case 'Deck':
        object.meta = deckById[object.meta_id];
        break;
      case 'GameFlow':
        object.meta = gameFlowById[object.meta_id];
        break;
      default:
        object.meta = metaById[object.meta_id];
      }

      switch (object.container_type) {
      case 'Deck':
        const deck = deckById[object.container_id];
        deck.innerObjects.push(object);
        object.container = deck;
        break;
      case 'PlayerArea':
        const area = areaById[object.container_id];
        area.innerObjects.push(object);
        object.container = area;
        break;
      default:
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
  gamePanesSelector,
  playersSelector,
  (camera, meta, selectedIds, isDragging, messages, gameObjects, selectedObjects, gamePanes, players) => {
    return { camera, meta, selectedIds, isDragging, messages, gameObjects, selectedObjects, gamePanes, players };
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