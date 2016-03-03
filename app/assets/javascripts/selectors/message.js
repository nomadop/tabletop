import { createSelector } from 'reselect';

const messageByIdSelector = state => state.messages.byId;
const messageIdsSelector = state => state.messages.ids;

export default createSelector(
  messageByIdSelector,
  messageIdsSelector,
  (messageById, messageIds) => messageIds.map(id => messageById[id])
);