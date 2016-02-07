import { combineReducers } from 'redux';

function centerX(state = 0, action) {
  switch (action.type) {
  default:
    return state;
  }
}

function centerY(state = 0, action) {
  switch (action.type) {
  default:
    return state;
  }
}

function rotate(state = 0, action) {
  switch (action.type) {
  default:
    return state;
  }
}

function scale(state = 1, action) {
  switch (action.type) {
  default:
    return state;
  }
}

function angle(state = 60, action) {
  switch (action.type) {
  default:
    return state;
  }
}

function height(state = 1000, action) {
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
  height,
});
