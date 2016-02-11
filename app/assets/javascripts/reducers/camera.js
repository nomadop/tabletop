import { combineReducers } from 'redux';
import {
  MOVE_CAMERA_HORIZONTAL,
  MOVE_CAMERA_VERTICAL,
  ZOOM_CAMERA,
  ROTATE_CAMERA_HORIZONTAL,
  ROTATE_CAMERA_VERTICAL,
} from '../actions/action_types';

let rotateCache;
let rotateRad;
let rotateSin;
let rotateCos;

function getRotateRad() {
  return Math.PI * rotateCache / 180;
}

function getRotateSin() {
  return Math.sin(rotateRad);
}

function getRotateCos() {
  return Math.cos(rotateRad);
}

function reCalculateRotate(newRotate) {
  rotateCache = newRotate;
  rotateRad = getRotateRad();
  rotateSin = getRotateSin();
  rotateCos = getRotateCos();
}

reCalculateRotate(0);

function centerX(state = 0, action) {
  let offsetX;
  switch (action.type) {
  case MOVE_CAMERA_HORIZONTAL:
    offsetX = action.offset * rotateCos;
    return state + offsetX;
  case MOVE_CAMERA_VERTICAL:
    offsetX = action.offset * rotateSin;
    return state + offsetX;
  default:
    return state;
  }
}

function centerY(state = 0, action) {
  let offsetY;
  switch (action.type) {
  case MOVE_CAMERA_HORIZONTAL:
    offsetY = action.offset * rotateSin;
    return state - offsetY;
  case MOVE_CAMERA_VERTICAL:
    offsetY = action.offset * rotateCos;
    return state + offsetY;
  default:
    return state;
  }
}

function rotate(state = 0, action) {
  switch (action.type) {
  case ROTATE_CAMERA_HORIZONTAL:
    const newRotate = (state + action.offset) % 360;
    reCalculateRotate(newRotate);
    return newRotate;
  default:
    return state;
  }
}

function scale(state = 1, action) {
  switch (action.type) {
  case ZOOM_CAMERA:
    const newScale = state + action.offset;
    if (newScale <= 0.1) {
      return 0.1;
    }

    if (newScale >= 3) {
      return 3;
    }

    return newScale;
  default:
    return state;
  }
}

function angle(state = 60, action) {
  switch (action.type) {
  case ROTATE_CAMERA_VERTICAL:
    const newAngle = state + action.offset;
    if (newAngle > 60) {
      return 60;
    }

    if (newAngle < 0) {
      return 0;
    }

    return newAngle;
  default:
    return state;
  }
}

function perspective(state = 1000, action) {
  switch (action.type) {
  default:
    return state;
  }
}

export default combineReducers({
  centerX,
  centerY,
  rotate,
  scale,
  angle,
  perspective,
});
