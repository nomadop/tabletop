import { RECEIVE_MESSAGES } from '../constants/action_types';

export function receiveMessages(messages) {
  return {
    type: RECEIVE_MESSAGES,
    messages,
  };
}
