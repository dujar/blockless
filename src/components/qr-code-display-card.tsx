import React, { useState, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { FullScreenQRCodeModal } from './FullScreenQRCodeModal'; // Import the modal
import blocklessLogo from '../assets/blockless.svg';

interface QrCodeDisplayCardProps {
  value: string;
  mainLogo: string;
  logoWidth?: number;
  logoHeight?: number;
  overlayLogo?: string;
  overlayLogoSize?: number;
  title: string;
  subtitle?: string;
  detail?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  isClickable?: boolean;
  onClick?: () => void;
  isDisabled?: boolean;
  disabledMessage?: string;
  className?: string;
  tooltipText?: string;
}

export const QrCodeDisplayCard: React.FC<QrCodeDisplayCardProps> = ({
  value,
  mainLogo,
  logoWidth = 48,
  logoHeight = 48,
  overlayLogo,
  overlayLogoSize = 24,
  title,
  subtitle,
  detail,
  errorCorrectionLevel = 'M', // Changed default from 'H' to 'M' to allow more data
  isClickable = false,
  onClick,
  isDisabled = false,
  disabledMessage,
  className = '',
  tooltipText,
}) => {
  const [mainImgSrc, setMainImgSrc] = useState(mainLogo);
  const [overlayImgSrc, setOverlayImgSrc] = useState(overlayLogo);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMainImgSrc(mainLogo);
    setOverlayImgSrc(overlayLogo);
  }, [mainLogo, overlayLogo]);

  const handleMainImgError = () => setMainImgSrc(blocklessLogo);
  const handleOverlayImgError = () => setOverlayImgSrc(undefined);

  const handleCardClick = () => {
    if (onClick && !isDisabled) {
      onClick();
    } else if (isClickable && !isDisabled) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`relative p-2 border rounded-lg bg-base-100 border-gray-200 dark:border-gray-700 
                    text-center shadow-sm transition-all duration-200
                    ${isClickable && !isDisabled ? 'cursor-pointer hover:shadow-md hover:bg-base-300 dark:hover:bg-gray-700 glow-on-hover' : ''}
                    ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}
                    ${className}`}
        onClick={handleCardClick}
        data-tooltip-content={tooltipText}
        data-tooltip-id="qr-tooltip"
        data-tooltip-delay-show={500}
      >
        <div className="relative inline-block p-1 bg-white rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
          <QRCode
            value={value}
            size={192}
            quietZone={10}
            bgColor="#ffffff"
            fgColor="#000000"
            logoImage={mainImgSrc}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            removeQrCodeBehindLogo
            logoPadding={2}
            logoPaddingStyle="circle"
            qrStyle="squares"
            ecLevel={errorCorrectionLevel}
          />
          <img src={mainImgSrc} alt="Logo" className="hidden" onError={handleMainImgError} />
          {overlayImgSrc && (
            <img
              src={overlayImgSrc}
              alt="Overlay Logo"
              className="absolute top-2 left-2 rounded-full object-contain bg-white p-0.5"
              style={{ width: overlayLogoSize, height: overlayLogoSize, boxShadow: '0 0 5px rgba(0,0,0,0.2)' }}
              onError={handleOverlayImgError}
            />
          )}
          {isDisabled && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <svg className="w-16 h-16 text-red-700 dark:text-red-300 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          )}
        </div>
        <h4 className="mt-4 text-base font-semibold text-base-content truncate">{title}</h4>
        {subtitle && <p className="text-sm text-neutral-content truncate">{subtitle}</p>}
        {detail && <p className="text-xs text-neutral-content truncate">{detail}</p>}
        {isDisabled && disabledMessage && <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">{disabledMessage}</p>}
        {isDisabled && <p className="mt-1 text-xs text-neutral-content">If you believe this is an error, please report it — this feature is in beta. We apologize for any inconvenience.</p>}
      </div>
      {isModalOpen && (
        <FullScreenQRCodeModal
          value={value}
          mainLogo={mainImgSrc}
          title={title}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

