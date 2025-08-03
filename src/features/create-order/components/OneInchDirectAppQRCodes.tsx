import React, { useMemo, useState } from 'react';
import OneInchLogo from '../../../assets/1inch.svg';
import { getTokenLogoURI, formatTokenAmountWithSymbol } from '../../../utils/token-helpers';
import { QrCodeDisplayCard } from '../../../components/qr-code-display-card';
import type { OrderData } from '../hooks/useCreateOrderForm';
import { getChainDetailsByChainId } from '../../../data/blockchains';
import { FullScreenQRCode } from '../../wallet-deeplink/components/FullScreenQRCode';

interface OneInchDirectAppQRCodesProps {
    order: OrderData;
}

const OneInchDirectAppQRCodes: React.FC<OneInchDirectAppQRCodesProps> = ({ order }) => {
    const [fullScreenQR, setFullScreenQR] = useState<{
        value: string;
        chainName: string;
        tokenSymbol: string;
        tokenAmount: string;
        tokenInfo: {
            address: string;
            chainId: number;
            decimals: number;
            logoURI: string;
            name: string;
            symbol: string;
            tags: string[];
        };
        recipientAddress: string;
    } | null>(null);
        

    // Generate individual 1inch app links for each payable token
    const oneInchPaymentQRs = useMemo(() => {
        const qrs = [];
        for (const chainConfig of order.chains) {
            const chainDetails = getChainDetailsByChainId(chainConfig.chainId);
            if (!chainDetails) continue;

            for (const token of chainConfig.tokens) {
                if (parseFloat(token.amount) > 0) {
                    const oneInchAppUrl = `https://app.1inch.io/swap?dst=${token.amount}:${token.symbol}`;
                    
                    qrs.push({
                        value: oneInchAppUrl,
                        chainName: chainConfig.name,
                        tokenSymbol: token.symbol,
                        tokenAmount: token.amount,
                        tokenInfo: token.info,
                        recipientAddress: chainConfig.address,
                    });
                }
            }
        }
        return qrs;
    }, [order]);

    if (fullScreenQR) {
        return (
            <FullScreenQRCode
                wallet={{ deeplink: fullScreenQR.value, name: '1inch Wallet', logo: OneInchLogo }}
                blockchainName={fullScreenQR.chainName}
                tokenSymbol={fullScreenQR.tokenSymbol}
                amount={fullScreenQR.tokenAmount}
                recipientAddress={fullScreenQR.recipientAddress}
                fiatAmount={order.fiatAmount}
                fiatCurrency={order.fiatCurrency}
                onClose={() => setFullScreenQR(null)}
            />
        );
    }

    if (oneInchPaymentQRs.length === 0) {
        return (
            <div className="text-center text-neutral-content p-4">
                No active payment methods configured for direct 1inch app swaps.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <p className="text-neutral-content mb-4">
                Scan one of these QR codes to open the 1inch app on your device and initiate a payment using a direct cross-chain swap.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {oneInchPaymentQRs.map((qr) => {
                    const tokenLogo = qr.tokenInfo.logoURI || getTokenLogoURI(qr.tokenInfo.address, qr.tokenInfo.symbol, qr.chainName);

                    return (
                        <QrCodeDisplayCard
                            key={`${qr.chainName}-${qr.tokenSymbol}`}
                            value={qr.value}
                            mainLogo={OneInchLogo}
                            logoWidth={32}
                            logoHeight={32}
                            overlayLogo={tokenLogo} // Display token logo within the QR
                            overlayLogoSize={24}
                            title={`${formatTokenAmountWithSymbol({ amount: qr.tokenAmount, tokenData: qr.tokenInfo })}`}
                            subtitle={`on ${qr.chainName}`}
                            detail="Direct 1inch App Link"
                            errorCorrectionLevel="H"
                            isClickable={true}
                            onClick={() => setFullScreenQR(qr)}
                            tooltipText={`Payment: ${qr.tokenAmount} ${qr.tokenSymbol} on ${qr.chainName}\nRedirects to 1inch app for swap.`}
                        />
                    );
                })}
            </div>
             <p className="mt-8 text-sm text-yellow-600 dark:text-yellow-400">
                Each QR code links directly to the 1inch mobile application (or website) to facilitate a swap to the specified token and chain. Ensure you have the 1inch Wallet or a compatible mobile browser with dApp support installed.
            </p>
        </div>
    );
};

export default OneInchDirectAppQRCodes;

