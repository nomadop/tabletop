import { createSelector } from 'reselect';

const messageByIdSelector = state => state.messages.byId;
const messageIdsSelector = state => state.messages.ids;

export default createSelector(
  messageByIdSelector,
  messageIdsSelector,
  (messageById, messageIds) => {
    const length = messageIds.length;
    const ids = length > 100 ? messageIds.slice(length - 100) : messageIds;
    return ids.map(id => messageById[id]);
  }
);