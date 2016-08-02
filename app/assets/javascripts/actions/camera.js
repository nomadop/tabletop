import {
  MOVE_CAMERA_HORIZONTAL,
  MOVE_CAMERA_VERTICAL,
  ZOOM_CAMERA,
  ROTATE_CAMERA_HORIZONTAL,
  ROTATE_CAMERA_VERTICAL,
  SET_CAMERA,
} from '../constants/action_types';

export function moveCameraHorizontal(offset) {
  return {
    type: MOVE_CAMERA_HORIZONTAL,
    offset,
  };
}

export function moveCameraVertical(offset) {
  return {
    type: MOVE_CAMERA_VERTICAL,
    offset,
  };
}

export function zoomCamera(offset) {
  return {
    type: ZOOM_CAMERA,
    offset,
  };
}

export function rotateCameraHorizontal(offset) {
  return {
    type: ROTATE_CAMERA_HORIZONTAL,
    offset,
  };
}

export function rotateCameraVertical(offset) {
  return {
    type: ROTATE_CAMERA_VERTICAL,
    offset,
  };
}

export function setCamera(camera) {
  return {
    type: SET_CAMERA,
    camera,
  };
}
