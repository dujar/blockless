import type { VercelRequest, VercelResponse } from '@vercel/node';
// import { NetworkEnum, SDK } from '@1inch/cross-chain-sdk';
import { SDK } from '@1inch/cross-chain-sdk';



export default async function handler(req: VercelRequest, res: VercelResponse) {

    // Allow only http://localhost:* or a single user-defined origin
    const origin = req.headers.origin || '';
    const isLocalhost = /^https?:\/\/localhost(:\d+)?$/i.test(origin);
    const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
    const isAllowedOrigin = origin === allowedOrigin;

    if (isLocalhost || isAllowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    // Short-circuit pre-flight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    const { API_AUTH_TOKEN } = process.env;

    if (!API_AUTH_TOKEN) {
        return res.status(500).json({ error: "API_AUTH_TOKEN is missing from env" });
    }

      
      
    
    const sdk = new SDK({
        url: 'https://api.1inch.dev/fusion-plus',
        authKey: API_AUTH_TOKEN,
        // blockchainProvider: new PrivateKeyProviderConnector(privateKey, web3) // only required for order creation  
    })

    
    // estimate    
    const quote = await sdk.getQuote({
        amount: '10000000',
        srcChainId: 137, // NetworkEnum.POLYGON,
        dstChainId: 56, // NetworkEnum.BINANCE,
        enableEstimate: true,
        srcTokenAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT  
        dstTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // BNB  
        walletAddress: ""
    })

    res.send({quote})
    // const preset = PresetEnum.fast

    // generate secrets  
    // const secrets = Array.from({
    //     length: quote.presets[preset].secretsCount
    // }).map(() => '0x' + randomBytes(32).toString('hex'))

    // const hashLock =
    //     secrets.length === 1
    //         ? HashLock.forSingleFill(secrets[0])
    //         : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets))

    // const secretHashes = secrets.map((s) => HashLock.hashSecret(s))

    // create order  
    // const { hash, quoteId, order } = await sdk.createOrder(quote, {
    //     walletAddress,
    //     hashLock,
    //     preset,
    //     source,
    //     secretHashes
    // })
    // console.log({ hash }, 'order created')

    // submit order  
    // const _orderInfo = await sdk.submitOrder(
    //     quote.srcChainId,
    //     order,
    //     quoteId,
    //     secretHashes
    // )
    // console.log({ hash }, 'order submitted')

    // submit secrets for deployed escrows  
    // while (true) {
    //     const secretsToShare = await sdk.getReadyToAcceptSecretFills(hash)

    //     if (secretsToShare.fills.length) {
    //         for (const { idx } of secretsToShare.fills) {
    //             await sdk.submitSecret(hash, secrets[idx])

    //             console.log({ idx }, 'shared secret')
    //         }
    //     }

    //     // check if order finished  
    //     const { status } = await sdk.getOrderStatus(hash)

    //     if (
    //         status === OrderStatus.Executed ||
    //         status === OrderStatus.Expired ||
    //         status === OrderStatus.Refunded
    //     ) {
    //         break
    //     }

    //     await sleep(1000)
    // }

    // const statusResponse = await sdk.getOrderStatus(hash)

    // console.log(statusResponse)
}  