import React from "react";

const Modal = ({ onClose, header, children, showCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg text-white w-[90vw] max-w-4xl">
        <h2 className="text-xl font-bold mb-4">{header}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
