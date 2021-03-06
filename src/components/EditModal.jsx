import React from "react";
import Modal from "react-modal";
import PropTypes from "prop-types";

Modal.setAppElement("#root");

class EditModal extends React.Component {

  closeModal = () => {
    this.props.closeModal();
  };

  handleUpdate = () => {
    this.props.controlUpdate();
    this.props.closeModal();
  };

  render() {
    return (
      <div>
        <Modal
          closeTimeoutMS={150}
          isOpen={this.props.openModal}
          overlayClassName="ReactModal__Overlay"
          className="ReactModal__Content ReactModal__message-content"
          onRequestClose={this.closeModal}
          contentLabel="Edit Word"
        >
          <h2>{this.props.title}</h2>
          {this.props.desc && (
            <p>{this.props.desc}</p>
          )}
          <input
            onChange={e => this.props.updateText(e.target.value)}
            className="edit-word-input"
            type="text"
            value={this.props.text}
          />
          <button onClick={this.handleUpdate} className="edit-word-btn">
            {this.props.btnText}
          </button>
        </Modal>
      </div>
    );
  }
}

EditModal.propTypes = {
  title: PropTypes.string.isRequired,
  btnText: PropTypes.string.isRequired,
  desc: PropTypes.string,
  text: PropTypes.string.isRequired,
  updateText: PropTypes.func.isRequired,
  controlUpdate: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.bool.isRequired
};

export default EditModal;
