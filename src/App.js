import React, { useState } from "react";
import Modal from "./components/modal";
import Cropper from "./components/cropper";

const App = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-4">
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        onClick={() => setShowModal(true)}
      >
        Open Cropper
      </button>

      {showModal && (
        <Modal header={"Cropper"}>
          <Cropper onClose={() => setShowModal(false)} />
        </Modal>
      )}
    </div>
  );
};

export default App;
