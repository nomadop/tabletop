import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { initRecording, startRecording, stopRecording, playRecording, downloadRecording, uploadRecording } from '../utils/recorder';

class Lobby extends Component {
  componentDidMount() {
    initRecording(
      this.handleLog.bind(this),
      this.refs.recordingList
    );
  }

  handleLog(...args) {
    const logger = this.refs.logger;
    const span = document.createElement('span');
    span.innerHTML = args.map(msg => msg.toString()).join(' ');
    const br = document.createElement('br');
    logger.appendChild(span);
    logger.appendChild(br);
  }

  render() {
    return (
      <div className="test-recorder">
        <button onClick={startRecording}>Start</button>
        <button onClick={stopRecording.bind(this, null)}>Stop</button>
        <button onClick={playRecording}>Play</button>
        <button onClick={downloadRecording}>Download</button>
        <button onClick={uploadRecording}>Upload</button>
        <ul ref="recordingList" className="recordingList"/>
        <div ref="logger" className="logger"></div>
      </div>
    );
  }
}

export default Lobby;
