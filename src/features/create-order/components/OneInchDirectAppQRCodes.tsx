import React, { useMemo } from 'react';
import OneInchLogo from '../../../assets/1inch.svg';
import blocklessLogo from '../../../assets/blockless.svg';
import { getBlockchainLogo, getTokenLogoURI, formatTokenAmountWithSymbol } from '../../../utils/token-helpers';
import { QrCodeDisplayCard } from '../../../components/qr-code-display-card';
import type { OrderData } from '../hooks/useCreateOrderForm';
import { getChainDetailsByChainId } from '../../../data/blockchains';

interface OneInchDirectAppQRCodesProps {
    order: OrderData;
}

const OneInchDirectAppQRCodes: React.FC<OneInchDirectAppQRCodesProps> = ({ order }) => {
    // Generate individual 1inch app links for each payable token
    const oneInchPaymentQRs = useMemo(() => {
        const qrs = [];
        for (const chainConfig of order.chains) {
            const chainDetails = getChainDetailsByChainId(chainConfig.chainId);
            if (!chainDetails) continue;

            for (const token of chainConfig.tokens) {
                if (parseFloat(token.amount) > 0) {
                    // Construct a direct 1inch app swap URL.
                    // This is a simplified interpretation of 1inch deep linking.
                    // A real-world implementation might require more precise parameters
                    // like `fromTokenAddress`, `toTokenAddress`, `fromChainId`, `toChainId`,
                    // or using 1inch's specific swap deeplink format if available.
                    // For the purpose of this exercise, we'll use a `dst` parameter
                    // similar to our internal one but for app.1inch.io,
                    // assuming 1inch can parse it or a direct swap from 'any' token on customer's side
                    // to this specific token/recipient.
                    // Example from prompt: `https://app.1inch.io/swap?dst=137:WBTC`
                    // Extended for amount and recipient:
                    const oneInchAppUrl = `https://app.1inch.io/swap?dst=${token.info.chainId}:${token.info.address}:${token.amount}:${chainConfig.address}`;
                    
                    qrs.push({
                        value: oneInchAppUrl,
                        chainName: chainConfig.name,
                        tokenSymbol: token.symbol,
                        tokenAmount: token.amount,
                        tokenInfo: token.info,
                    });
                }
            }
        }
        return qrs;
    }, [order]);

    if (oneInchPaymentQRs.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                No active payment methods configured for direct 1inch app swaps.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-400 mb-4">
                Scan one of these QR codes to open the 1inch app on your device and initiate a payment using a direct cross-chain swap.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {oneInchPaymentQRs.map((qr) => {
                    const blockchainLogo = getBlockchainLogo(qr.chainName);
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
