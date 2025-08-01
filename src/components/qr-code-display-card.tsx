import React, { useState, useRef, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import blocklessLogo from '../assets/blockless.svg'; // Default fallback logo

interface QrCodeDisplayCardProps {
  value: string;
  mainLogo: string; // The primary logo to embed in the QR (e.g., wallet, Blockless, 1inch)
  logoWidth?: number;
  logoHeight?: number;
  overlayLogo?: string; // An optional secondary logo to display on the card (e.g., chain logo on top of wallet logo)
  overlayLogoSize?: number;
  title: string;
  subtitle?: string;
  detail?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  isClickable?: boolean; // If true, applies hover effects and indicates clickability
  onClick?: () => void;
  isDisabled?: boolean; // If true, renders an overlay indicating it's disabled
  disabledMessage?: string; // Message to show when disabled
  className?: string; // Additional classes for the main div
  tooltipText?: string; // Text for the tooltip on hover
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
  errorCorrectionLevel = 'H',
  isClickable = false,
  onClick,
  isDisabled = false,
  disabledMessage,
  className = '',
  tooltipText,
}) => {
  const [mainImgSrc, setMainImgSrc] = useState(mainLogo);
  const [overlayImgSrc, setOverlayImgSrc] = useState(overlayLogo);
  const qrRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMainImgSrc(mainLogo);
    setOverlayImgSrc(overlayLogo);
  }, [mainLogo, overlayLogo]);

  const handleMainImgError = () => {
    setMainImgSrc(blocklessLogo);
  };

  const handleOverlayImgError = () => {
    setOverlayImgSrc(undefined); // Remove overlay logo if it fails to load
  };

  const handleCardClick = () => {
    if (isClickable && onClick && !isDisabled) {
      onClick();
    }
  };

  return (
    <div
      className={`relative p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                  text-center shadow-sm transition-all duration-200
                  ${isClickable && !isDisabled ? 'cursor-pointer hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 glow-on-hover' : ''}
                  ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}
                  ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-tooltip-content={tooltipText}
      data-tooltip-id="qr-tooltip"
      data-tooltip-delay-show={500}
    >
      {/* Tooltip component (assuming it's globally available or imported) */}
      {/* Example: <Tooltip id="qr-tooltip" effect="solid" /> */}

      <div className="relative inline-block p-1 bg-white rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
        <QRCode
          value={value}
          size={192} // Fixed size for consistency within cards
          quietZone={10}
          bgColor="#ffffff"
          fgColor="#000000"
          logoImage={mainImgSrc}
          logoWidth={logoWidth}
          logoHeight={logoHeight}
          removeQrCodeBehindLogo={true}
          logoPadding={2}
          logoPaddingStyle="circle"
          qrStyle="squares"
          ecLevel={errorCorrectionLevel}
          // The onError is a prop on the QRCode component itself, not the img element inside
          // We handle img error states via our own image elements.
        />
        {/* Fallback image for the main logo in case QRCode component's internal handling isn't sufficient */}
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
            <svg
              className="w-16 h-16 text-red-700 dark:text-red-300 transform -rotate-45"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        )}
      </div>

      <h4 className="mt-4 text-base font-semibold text-gray-900 dark:text-white truncate">{title}</h4>
      {subtitle && <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{subtitle}</p>}
      {detail && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{detail}</p>}

      {isDisabled && disabledMessage && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">{disabledMessage}</p>
      )}
       {isDisabled && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If you believe this is an error, please report it — this feature is in beta. We apologize for any inconvenience.
        </p>
       )}
    </div>
  );
};

