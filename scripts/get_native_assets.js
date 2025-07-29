import axios from 'axios';
import { writeFile } from 'fs/promises';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getNativeTokenInfo() {
    // Map of major blockchains to their CoinGecko token IDs
    const blockchainTokens = {
        "bitcoin": "bitcoin",
        "ethereum": "ethereum",
        "binancecoin": "binancecoin",
        "solana": "solana",
        "polygon": "matic-network",
        "avalanche": "avalanche-2",
        "polkadot": "polkadot",
        "cardano": "cardano",
        "litecoin": "litecoin",
        "chainlink": "chainlink",
        "uniswap": "uniswap",
        "cosmos": "cosmos",
        "algorand": "algorand",
        "near": "near",
        "tron": "tron",
        "stellar": "stellar",
        "filecoin": "filecoin",
        "monero": "monero",
        "elrond": "elrond-erd-2",
        "tezos": "tezos",
        "eos": "eos",
        "iota": "iota",
        "dash": "dash",
        "zcash": "zcash",
        "decred": "decred",
        "nano": "nano",
        "waves": "waves",
        "theta-token": "theta-token",
        "hbar": "hedera-hashgraph",
        "kava": "kava",
        "celo": "celo",
        "harmony": "harmony",
        "oasis": "oasis-network",
        "iotex": "iotex",
        "zilliqa": "zilliqa",
        "nexo": "nexo",
        "sushi": "sushi",
        "aave": "aave",
        "maker": "maker",
        "compound": "compound",
        "synthetix": "synthetix-network-token",
        "yearn-finance": "yearn-finance",
        "balancer": "balancer",
        "curve-dao-token": "curve-dao-token",
        "1inch": "1inch",
        "0x": "0x",
        "republic-protocol": "republic-protocol",
        "golem": "golem",
        "bancor": "bancor",
        "kyber-network": "kyber-network-crystal",
        "loopring": "loopring",
        "enjincoin": "enjincoin",
        "chiliz": "chiliz",
        "axie-infinity": "axie-infinity",
        "the-graph": "the-graph",
        "flow": "flow",
        "klaytn": "klay-token",
        "arbitrum": "arbitrum",
        "optimism": "optimism",
        "fantom": "fantom",
        "cronos": "crypto-com-chain",
        "moonbeam": "moonbeam",
        "moonriver": "moonriver",
        "astar": "astar",
        "conflux": "conflux-token",
        "ecash": "ecash",
        "nervos-network": "nervos-network",
        "mina-protocol": "mina-protocol",
        "radix": "radix",
        "secret": "secret",
        "siacoin": "siacoin",
        "skale": "skale",
        "thorchain": "thorchain",
        "band-protocol": "band-protocol",
        "injective-protocol": "injective-protocol",
        "kadena": "kadena",
        "stacks": "stacks",
        "syscoin": "syscoin",
        "wax": "wax",
        "icon": "icon",
        "ontology": "ontology",
        "vechain": "vechain",
        "qtum": "qtum",
        "ethereum-classic": "ethereum-classic",
        "ravencoin": "ravencoin",
        "horizen": "horizen",
        "komodo": "komodo",
        "pivx": "pivx",
        "verge": "verge",
        "digibyte": "digibyte",
        "zcoin": "firo",
        "particl": "particl",
        "navcoin": "nav-coin",
        "peercoin": "peercoin",
        "blackcoin": "blackcoin",
        "reddcoin": "reddcoin",
        "potcoin": "potcoin",
        "feathercoin": "feathercoin",
        "namecoin": "namecoin",
        "auroracoin": "auroracoin",
        "primecoin": "primecoin",
        "gridcoin": "gridcoin",
        "diamond": "diamond",
        "sexcoin": "sexcoin",
        "hempcoin": "hempcoin",
        "spreadcoin": "spreadcoin",
        "dogecoin": "dogecoin",
        "bitcoin-cash": "bitcoin-cash",
        "bitcoin-sv": "bitcoin-sv",
        "nxt": "nxt",
        "neo": "neo"
    };

    const results = [];
    const tokenEntries = Object.entries(blockchainTokens);
    const requestsPerBatch = 10;
    const batchInterval = 100000; // 
    console.log(`Processing ${tokenEntries.length} tokens in batches of ${requestsPerBatch}...`);

    for (let i = 0; i < tokenEntries.length; i += requestsPerBatch) {
        const batch = tokenEntries.slice(i, i + requestsPerBatch);
        console.log(`\nProcessing batch ${Math.floor(i/requestsPerBatch) + 1}/${Math.ceil(tokenEntries.length/requestsPerBatch)}`);

        // Process current batch
        const batchPromises = batch.map(async ([name, tokenId]) => {
            try {
                const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenId}`, {
                    headers: {
                        ...(process.env.VITE_COINGECKO_API_KEY && {
                            'Authorization': `Bearer ${process.env.VITE_COINGECKO_API_KEY}`
                        })
                    },
                    timeout: 10000 // 10 second timeout
                });
                
                const data = response.data;
                const tokenInfo = {
                    blockchain: name,
                    tokenName: data.name,
                    tokenSymbol: data.symbol.toUpperCase(),
                    description: data.description.en.substring(0, 200) + '...',
                    logo: data.image.large,
                    tokenId: tokenId
                };
                
                results.push(tokenInfo);
                console.log(`✓ ${name} (${data.symbol.toUpperCase()})`);
                return tokenInfo;
            } catch (error) {
                console.error(`✗ Failed to fetch data for ${name} (ID: ${tokenId})`);
                console.error(`  Error: ${error.message}`);
                return null;
            }
        });

        // Wait for all requests in current batch to complete
        await Promise.all(batchPromises);

        // Save intermediate results
        await saveResultsToFile(results);

        // Wait before processing next batch (except for the last batch)
        if (i + requestsPerBatch < tokenEntries.length) {
            console.log(`Waiting ${batchInterval/1000} seconds before next batch...`);
            await delay(batchInterval);
        }
    }

    // Save final results
    await saveResultsToFile(results);
    console.log(`\n✅ Completed! Saved ${results.length} tokens to native-tokens.json`);
}

async function saveResultsToFile(results) {
    try {
        const jsonData = JSON.stringify(results, null, 2);
        await writeFile('native-tokens.json', jsonData);
        console.log(`💾 Saved ${results.length} tokens to native-tokens.json`);
    } catch (error) {
        console.error('Failed to save results to file:', error.message);
    }
}

// Run the function
getNativeTokenInfo().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});