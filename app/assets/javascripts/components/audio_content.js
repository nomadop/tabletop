import React, { Component, PropTypes } from 'react';

export default class AudioContent extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      playing: false,
      played: false,
    };
    const audio = new Audio(this.props.src);
    audio.autoplay = this.props.newReceived;
    audio.addEventListener('loadedmetadata', this.initState.bind(this));
    audio.addEventListener('play', this.handlePlay.bind(this));
    audio.addEventListener('ended', this.handleEnd.bind(this));
    audio.addEventListener('pause', this.handleEnd.bind(this));
    audio.addEventListener('error', (e) => console.log(e));
    this.audio = audio;
  }

  get style() {
    const duration = this.state.duration;
    let width = duration ? duration * 10 : 38;
    if (width < 38) {
      width = 38;
    } else if (width > 100) {
      width = 120;
    }

    return { width };
  }

  initState() {
    this.setState({
      duration: this.audio.duration
    });
  }

  handlePlay() {
    this.audio.currentTime = 0;
    this.setState({
      playing: true,
      played: true,
    });
  }

  handleEnd() {
    this.setState({
      playing: false,
    });
  }

  handleClick() {
    const audio = this.audio;
    audio.paused ? audio.play() : audio.pause();
  }

  render() {
    const { duration, playing, played } = this.state;
    const newAudio = this.props.newReceived && !played;
    if (duration) {
      return (
        <span className="content audio-control" style={this.style} onClick={this.handleClick.bind(this)}>
          {Math.round(duration) + '"'}
          {newAudio ? <i className="new-audio fa fa-circle"/> : null}
          <i className={`playing fa fa-volume-${playing ? 'up' : 'off'}`}/>
        </span>
      );
    } else {
      return (
        <span className="content audio-control" style={this.style}>
          <i className="fa fa-spinner fa-spin"/>
        </span>
      );
    }
  }
}

AudioContent.propTypes = {
  src: PropTypes.string,
  newReceived: PropTypes.bool,
};
