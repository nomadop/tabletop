import React, { Component, PropTypes } from 'react';
import GamePane from './game_pane';

export default class EditObjectPane extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      scale: 1,
    };
  }

  get editorStyle() {
    const { scale } = this.state;
    const { gameObject } = this.props;
    const { meta } = gameObject;
    const { height, width, front_img } = meta;
    const background = `url(${front_img.url})`;
    const transform = `scale(${scale}, ${scale})`;

    return {
      width,
      height,
      background,
      transform,
    }
  }

  handleFileChange(event) {
    const { target } = event;
    const file = target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.refs.preview.src = reader.result;
  }

  handleZoom(offset) {
    const { scale } = this.state;
    this.setState({ scale: scale + offset });
  }

  renderToolbox() {
    return (
      <div className="toolbox">
        <span className="tool" onClick={this.handleZoom.bind(this, 0.2)}>
          <i className="fa fa-fw fa-search-plus"/>
        </span>
        <span className="tool" onClick={this.handleZoom.bind(this, -0.2)}>
          <i className="fa fa-fw fa-search-minus"/>
        </span>
        <span className="tool"><i className="fa fa-fw fa-mouse-pointer"/></span>
        <span className="tool"><i className="fa fa-fw fa-square-o"/></span>
        <span className="tool"><i className="fa fa-fw fa-font"/></span>
        <span className="tool"><i className="fa fa-fw fa-eraser"/></span>
      </div>
    );
  }

  renderEditor() {
    return (
      <div className="editor">
        <span className="game-object" style={this.editorStyle}/>
      </div>
    );
  }

  renderMarkerPane() {
    return (
      <div className="marker-pane">
        <img src="" alt="preview" className="preview" ref="preview"/>
        <input type="file" className="upload" onChange={this.handleFileChange.bind(this)}/>
        <button>添加</button>
      </div>
    );
  }

  render() {
    const { gameObject } = this.props;
    return (
      <GamePane className="edit-object-pane"
                title={`编辑${gameObject.meta.name}`}
                width={640} height={480}
                onClose={this.props.onClose}
      >
        {this.renderEditor()}
        {this.renderToolbox()}
        {this.renderMarkerPane()}
      </GamePane>
    );
  }
}

EditObjectPane.propTypes = {
  meta: PropTypes.array,
  gameObject: PropTypes.object,
  onClose: PropTypes.func,
  systemWarning: PropTypes.func,
};
