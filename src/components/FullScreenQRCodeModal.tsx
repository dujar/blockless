
import React from 'react';
import { QRCode } from 'react-qrcode-logo';

interface FullScreenQRCodeModalProps {
  value: string;
  mainLogo: string;
  title: string;
  onClose: () => void;
}

export const FullScreenQRCodeModal: React.FC<FullScreenQRCodeModalProps> = ({ value, mainLogo, title, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-base-100 p-8 rounded-lg shadow-2xl flex flex-col items-center relative max-w-md w-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-neutral-content hover:text-base-content transition-colors"
          aria-label="Close QR Code Modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h3 className="text-2xl font-bold text-base-content mb-4">{title}</h3>
        <div className="p-4 bg-white rounded-md border-4 border-gray-200">
          <QRCode
            value={value}
            size={256} // Larger size for the modal
            logoImage={mainLogo}
            logoWidth={64}
            logoHeight={64}
            qrStyle="squares"
            ecLevel="H"
          />
        </div>
        <p className="mt-4 text-sm text-neutral-content">Scan this code with your wallet app.</p>
      </div>
    </div>
  );
};
