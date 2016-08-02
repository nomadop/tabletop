import React, { Component, PropTypes } from 'react';
import update from 'react-addons-update';
import GamePane from './game_pane';
import Marker from './marker';
import classNames from '../utils/class_names';

export default class EditObjectPane extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      scale: 1,
      tool: 'pointer',
      markers: this.props.gameObject.markers.slice(),
    };
    this.markerIdCounter = 0;
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

  handleSetTool(tool) {
    this.setState({ tool });
  }

  handleAddMarker(type, content) {
    const { markers } = this.state;
    const newMarker = markers.slice();

    this.markerIdCounter++;
    const marker = {
      id: 'temp' + this.markerIdCounter,
      marker_type: type,
      top: 0,
      left: 0,
      scale: 1,
      rotate: 0,
      content,
    };

    newMarker.push(marker);
    this.setState({
      markers: newMarker,
    });
  }

  handleAddImageMarker() {
    const src = this.refs.preview.src;
    if (src && src.length) {
      const content = {
        src,
      };
      this.handleAddMarker('image', content);
    } else {
      this.props.systemWarning('必须先选择一个图标');
    }
  }

  handleAddIconMarker() {
    const value = this.refs.iconClass.value;
    if (value.length) {
      const content = {
        class_name: value,
      };
      this.handleAddMarker('icon', content);
    } else {
      this.props.systemWarning('class不能为空');
    }
  }

  handleUpdateMarker(markerId, updater) {
    const { markers } = this.state;
    const newMarker = markers.map(marker => {
      if (marker.id === markerId) {
        return update(marker, updater);
      }

      return marker;
    });
    this.setState({
      markers: newMarker,
    });
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
        <span className="tool" onClick={this.handleSetTool.bind(this, 'pointer')}>
          <i className="fa fa-fw fa-mouse-pointer"/>
        </span>
        <span className="tool" onClick={this.handleSetTool.bind(this, 'rect')}>
          <i className="fa fa-fw fa-square-o"/>
        </span>
      </div>
    );
  }

  renderEditor() {
    const { tool, markers } = this.state;
    return (
      <div className={classNames('editor', tool)}>
        <div className="game-object" style={this.editorStyle}>
          {markers.map(marker => (
            <Marker key={marker.id} marker={marker} editMode={true} update={this.handleUpdateMarker.bind(this, marker.id)}/>
          ))}
        </div>
      </div>
    );
  }

  renderMarkerPane() {
    return (
      <div className="marker-pane">
        <img src="" alt="preview" className="preview" ref="preview"/>
        <input type="file" className="upload" onChange={this.handleFileChange.bind(this)}/>
        <button onClick={this.handleAddImageMarker.bind(this)}>添加</button>
        <span className="spliter"/>
        <input type="text" ref="iconClass"/>
        <button onClick={this.handleAddIconMarker.bind(this)}>添加</button>
      </div>
    );
  }

  renderNormalObject() {
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

  renderFlowObject() {
    const { game, gameObject } = this.props;
    return (
      <GamePane className="edit-object-pane"
                title={`编辑${gameObject.meta.name}`}
                width={480} height={640}
                onClose={this.props.onClose}
      >
        <iframe src={`/games/${game.id}/game_flows/${gameObject.meta_id}/edit`} frameBorder="0"></iframe>
      </GamePane>
    );
  }

  render() {
    const { gameObject } = this.props;
    switch (gameObject.meta_type) {
    case 'GameFlow':
      return this.renderFlowObject();
    default:
      return this.renderNormalObject();
    }
  }
}

EditObjectPane.propTypes = {
  game: PropTypes.object,
  meta: PropTypes.array,
  gameObject: PropTypes.object,
  onClose: PropTypes.func,
  systemWarning: PropTypes.func,
};
