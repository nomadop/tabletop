import { NEW_MESSAGE } from '../constants/action_types';

export function newMessage(message) {
  return {
    type: NEW_MESSAGE,
    message,
  };
}
