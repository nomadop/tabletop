import React, { Component, PropTypes } from 'react';
import classNames from '../utils/class_names';

const MAXIMUM = 'maximum';
const MINIMUM = 'minimum';
const NORMAL = 'normal';

export default class GamePane extends Component {
  constructor() {
    super(...arguments);

    const { width, height } = this.props;
    this.state = {
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height,
      display: NORMAL,
      focus: true,
    };
    this.dragging = false;
    this.dragHandler = this.handleDrag.bind(this);
    this.dropHandler = this.handleDrop.bind(this);
  }

  get style() {
    const { display, focus } = this.state;

    switch (display) {
    case MAXIMUM:
      return {
        top: 20,
        left: 20,
        width: window.innerWidth - 40,
        height: window.innerHeight - 40,
        zIndex: 1,
      };
    case MINIMUM:
      return {
        position: 'relative',
        margin: 4,
      };
    case NORMAL:
    default:
      const { top, left, width, height } = this.state;
      return {
        top,
        left,
        width,
        height,
        zIndex: focus ? 1 : 0,
      };
    }
  }

  handleDragStart(event) {
    event.preventDefault();
    const { offsetX, offsetY } = event.nativeEvent;

    this.dragstartX = offsetX;
    this.dragstartY = offsetY;
    window.addEventListener('mousemove', this.dragHandler);
    window.addEventListener('mouseup', this.dropHandler);
  }

  handleDrag(event) {
    const { clientX, clientY } = event;

    this.setState({
      top: clientY - this.dragstartY,
      left: clientX - this.dragstartX,
    });
  }

  handleDrop() {
    window.removeEventListener('mousemove', this.dragHandler);
    window.removeEventListener('mouseup', this.dropHandler);
  }

  handleMaximum() {
    if (this.props.resizeable) {
      this.setState({ display: MAXIMUM });
    }
  }

  handleMinimum() {
    this.setState({ display: MINIMUM });
  }

  handleResume() {
    this.setState({ display: NORMAL });
  }

  handleFocus(focus) {
    this.setState({ focus });
  }

  handleResize(direction, event) {
    const { clientX, clientY } = event;
    if (!clientY && !clientX) {
      return;
    }

    const { top, left, width, height } = this.state;
    let newWidth = clientX - left;
    let newHeight = clientY - top;

    if (newWidth < 240) {
      newWidth = 240;
    }

    if (newHeight < 360) {
      newHeight = 360;
    }

    const newState = {};
    if (direction & 1 && newHeight !== height) {
      newState.height = newHeight;
    }

    if (direction & 2 && newWidth !== width) {
      newState.width = newWidth;
    }

    if (Object.keys(newState).length) {
      this.setState(newState);
    }
  }

  renderHeaderControl() {
    const controls = [];
    const display = this.state.display;
    const { resizeable, onClose } = this.props;
    if (display !== MINIMUM) {
      controls.push(<i className="fa fa-minus" key="minimum" onClick={this.handleMinimum.bind(this)}/>);
    } else {
      controls.push(<i className="fa fa-plus" key="minimum" onClick={this.handleResume.bind(this)}/>);
    }

    let className = '';
    if (!resizeable) {
      className = 'disabled ';
    }

    if (display !== MAXIMUM) {
      controls.push(<i className={className + "fa fa-expand"} key="maximum" onClick={this.handleMaximum.bind(this)}/>);
    } else {
      controls.push(<i className={className + "fa fa-compress"} key="maximum" onClick={this.handleResume.bind(this)}/>);
    }

    controls.push(<i className="fa fa-times" key="close" onClick={onClose}/>);
    return <div className="control">{controls}</div>;
  }

  renderHeader() {
    const { title, noHeader } = this.props;
    if (noHeader) {
      return;
    }

    return (
      <div className="pane-header" draggable="true" onDragStart={this.handleDragStart.bind(this)}>
        <span className="title">{title}</span>
        {this.renderHeaderControl()}
      </div>
    );
  }

  renderBody() {
    if (this.state.display !== MINIMUM) {
      return <div className="pane-body">{this.props.children}</div>
    }
  }

  renderResizer() {
    if (this.props.resizeable && this.state.display === NORMAL) {
      return ([
        <span className="resizer right-resizer" key="rr" onDrag={this.handleResize.bind(this, 2)} draggable="true"/>,
        <span className="resizer bottom-resizer" key="br" onDrag={this.handleResize.bind(this, 1)} draggable="true"/>,
        <span className="resizer bottom-right-resizer" key="brr" onDrag={this.handleResize.bind(this, 3)} draggable="true"/>,
      ]);
    }
  }

  render() {
    const { className } = this.props;
    const { display } = this.state;
    return (
      <div className={classNames({'game-pane': true, className, open: display !== MINIMUM})}
           tabIndex="1"
           style={this.style}
           onFocus={this.handleFocus.bind(this, true)}
           onBlur={this.handleFocus.bind(this, false)}
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderResizer()}
      </div>
    );
  }
}

GamePane.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  resizeable: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
  noHeader: PropTypes.bool,
};
