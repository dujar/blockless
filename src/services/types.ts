// Reusable types for API services

// #region Common
export interface BadRequestErrorDto {
    statusCode: number;
    message: string;
    error: string;
}
// #endregion

// #region Token API Types

export interface TagDto {
    provider: string;
    value: string;
}

/**
 * Represents a token from the API. Based on TokenDto.
 */
export interface TokenDto {
    chainId: number;
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
    rating?: number;
    eip2612?: boolean;
    isFoT?: boolean;
    tags?: TagDto[];
    providers?: string[];
}

export interface ProviderTokenDto extends Omit<TokenDto, 'rating' | 'tags'> {
    providers: string[];
    tags: string[];
}

export interface TokenInfoDto {
    address: string;
    chainId: number;
    decimals: number;
    extensions: Record<string, unknown>;
    logoURI: string;
    name: string;
    symbol: string;
    tags: string[];
}

export interface VersionDto {
    major: number;
    minor: number;
    patch: number;
}

export interface TokenListResponseDto {
    keywords: string[];
    logoURI: string;
    name: string;
    tags: Record<string, TagDto>;
    tags_order: string[];
    timestamp: string;
    tokens: TokenInfoDto[];
    version: VersionDto;
}

/**
 * Parameters for searching tokens.
 */
export interface SearchTokensParams {
    /** Text to search for in token address, token symbol, or description */
    query?: string;
    /** Whether to ignore listed tokens */
    ignore_listed?: boolean;
    only_positive_rating?: boolean;
    /** Maximum number of tokens to return */
    limit?: number;
    country?: string;
}

export interface WhitelistedTokensParams {
    provider?: string;
    country?: string;
}

// #endregion

// #region Balance API Types

/**
 * Represents the balance of tokens for a wallet.
 * The key is the token address, and the value is the balance in string format.
 */
export type WalletBalance = Record<string, string>;

export interface CustomTokensRequest {
    /** List of custom tokens addresses */
    tokens: string[];
}

export interface CustomTokensAndWalletsRequest {
    /** List of custom tokens addresses */
    tokens: string[];
    /** List of wallets addresses */
    wallets: string[];
}

export interface AggregatedBalancesAndAllowancesResponse {
    decimals: number;
    symbol: string;
    tags: string[];
    address: string;
    name: string;
    logoURI: string;
    isCustom: boolean;
    wallets: Record<string, any>;
    type: string;
    tracked?: boolean;
}

// #endregion

// #region Fusion+ API Types

// #region Relayer API Types (`relayer.json`)
export interface OrderInput {
    salt: string;
    makerAsset: string;
    takerAsset: string;
    maker: string;
    receiver: string;
    makingAmount: string;
    takingAmount: string;
    makerTraits: string;
}

export interface SignedOrderInput {
    order: OrderInput;
    srcChainId: number;
    signature: string;
    extension: string;
    quoteId: string;
    secretHashes?: string[];
}

export interface SecretInput {
    secret: string;
    orderHash: string;
}
// #endregion

// #region Quoter API Types (`quoter.json`)
export interface GetQuoteParams {
    srcChain: number;
    dstChain: number;
    srcTokenAddress: string;
    dstTokenAddress: string;
    amount: number;
    walletAddress: string;
    enableEstimate: boolean;
    fee?: number;
    isPermit2?: string;
    permit?: string;
}

export interface CustomPresetParams {
    // Empty in spec, can be extended if needed
}

export interface AuctionPoint {
    delay: number;
    coefficient: number;
}

export interface GasCostConfig {
    gasBumpEstimate: number;
    gasPriceEstimate: string;
}

export interface Preset {
    auctionDuration: number;
    startAuctionIn: number;
    initialRateBump: number;
    auctionStartAmount: string;
    startAmount: string;
    auctionEndAmount: string;
    exclusiveResolver: Record<string, unknown>;
    costInDstToken: string;
    points: AuctionPoint[];
    allowPartialFills: boolean;
    allowMultipleFills: boolean;
    gasCost: GasCostConfig;
    secretsCount: number;
}

export interface QuotePresets {
    fast: Preset;
    medium: Preset;
    slow: Preset;
    custom?: Preset;
}

export interface TimeLocks {
    srcWithdrawal: number;
    srcPublicWithdrawal: number;
    srcCancellation: number;
    srcPublicCancellation: number;
    dstWithdrawal: number;
    dstPublicWithdrawal: number;
    dstCancellation: number;
}

export interface TokenPair {
    srcToken: string;
    dstToken: string;
}

export interface PairCurrency {
    usd: TokenPair;
}

export interface GetQuoteOutput {
    quoteId: Record<string, unknown>;
    srcTokenAmount: string;
    dstTokenAmount: string;
    presets: QuotePresets;
    srcEscrowFactory: string;
    dstEscrowFactory: string;
    whitelist: string[];
    timeLocks: TimeLocks;
    srcSafetyDeposit: string;
    dstSafetyDeposit: string;
    recommendedPreset: "fast" | "slow" | "medium" | "custom";
    prices: PairCurrency;
    volume: PairCurrency;
}

export interface BuildOrderParams {
    srcChain: number;
    dstChain: number;
    srcTokenAddress: string;
    dstTokenAddress: string;
    amount: number;
    walletAddress: string;
    fee?: number;
    source?: string;
    isPermit2?: string;
    isMobile?: string;
    feeReceiver?: string;
    permit?: string;
    preset?: string;
}

export interface BuildOrderBody {
    quote: GetQuoteOutput;
    secretsHashList: string;
}

export interface BuildOrderOutput {
    typedData: Record<string, unknown>;
    orderHash: string;
    extension: string;
}
// #endregion

// #region Order API Types (`order.json`)

export interface GetActiveOrdersParams {
    page?: number;
    limit?: number;
    srcChain?: number;
    dstChain?: number;
}

export interface Meta {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface CrossChainOrderDto {
    salt: string;
    maker: string;
    receiver: string;
    makerAsset: string;
    takerAsset: string;
    makingAmount: string;
    takingAmount: string;
    makerTraits: string;
}

export interface ActiveOrdersOutput {
    orderHash: string;
    signature: string;
    deadline: number;
    auctionStartDate: number;
    auctionEndDate: number;
    quoteId: string;
    remainingMakerAmount: string;
    makerBalance: string;
    makerAllowance: string;
    isMakerContract: boolean;
    extension: string;
    srcChainId: number;
    dstChainId: number;
    order: CrossChainOrderDto;
    secretHashes?: string[][];
    fills: string[];
}

export interface GetActiveOrdersOutput {
    meta: Meta;
    items: ActiveOrdersOutput[];
}

export interface EscrowFactory {
    address: string;
}

export interface GetOrdersByMakerParams {
    page?: number;
    limit?: number;
    timestampFrom?: number;
    timestampTo?: number;
    srcToken?: string;
    dstToken?: string;
    withToken?: string;
    dstChainId?: number;
    srcChainId?: number;
    chainId?: number;
}

export type GetOrderByMakerOutput = GetActiveOrdersOutput;

export interface Immutables {
    orderHash: string;
    hashlock: string;
    maker: string;
    taker: string;
    token: string;
    amount: string;
    safetyDeposit: string;
    timelocks: string;
}

export interface PublicSecret {
    idx: number;
    secret: string;
    srcImmutables: Immutables;
    dstImmutables: Immutables;
}

export interface ResolverDataOutput {
    orderType: "SingleFill" | "MultipleFills";
    secrets: PublicSecret[];
    secretHashes?: string[][];
}

export interface ReadyToAcceptSecretFill {
    idx: number;
    srcEscrowDeployTxHash: string;
    dstEscrowDeployTxHash: string;
}

export interface ReadyToAcceptSecretFills {
    fills: ReadyToAcceptSecretFill[];
}

export interface ReadyToAcceptSecretFillsForOrder {
    orderHash: string;
    makerAddress: string;
    fills: ReadyToAcceptSecretFill[];
}

export interface ReadyToAcceptSecretFillsForAllOrders {
    orders: ReadyToAcceptSecretFillsForOrder[];
}

export interface ReadyToExecutePublicAction {
    action: "withdraw" | "cancel";
    immutables: Immutables;
    chainId: number;
    escrow: string;
    secret?: string;
}

export interface ReadyToExecutePublicActionsOutput {
    actions: ReadyToExecutePublicAction[];
}

export interface LimitOrderV4StructOutput {
    salt: string;
    maker: string;
    receiver: string;
    makerAsset: string;
    takerAsset: string;
    makingAmount: string;
    takingAmount: string;
    makerTraits: string;
}

export interface AuctionPointOutput {
    delay: number;
    coefficient: number;
}

export interface EscrowEventDataOutput {
    transactionHash: string;
    escrow: string;
    side: "src" | "dst";
    action: "src_escrow_created" | "dst_escrow_created" | "withdrawn" | "funds_rescued" | "escrow_cancelled";
    blockTimestamp: number;
}

export interface FillOutputDto {
    status: "pending" | "executed" | "refunding" | "refunded";
    txHash: string;
    filledMakerAmount: string;
    filledAuctionTakerAmount: string;
    escrowEvents: EscrowEventDataOutput[];
}

export interface GetOrderFillsByHashOutput {
    orderHash: string;
    status: "pending" | "executed" | "expired" | "cancelled" | "refunding" | "refunded";
    validation: "valid" | "order-predicate-returned-false" | "not-enough-balance" | "not-enough-allowance" | "invalid-permit-signature" | "invalid-permit-spender" | "invalid-permit-signer" | "invalid-signature" | "failed-to-parse-permit-details" | "unknown-permit-version" | "wrong-epoch-manager-and-bit-invalidator" | "failed-to-decode-remaining" | "unknown-failure";
    order: LimitOrderV4StructOutput;
    extension: string;
    points: AuctionPointOutput | null;
    approximateTakingAmount: string;
    positiveSurplus: string;
    fills: FillOutputDto[];
    auctionStartDate: number;
    auctionDuration: number;
    initialRateBump: number;
    createdAt: number;
    srcTokenPriceUsd: Record<string, unknown> | null;
    dstTokenPriceUsd: Record<string, unknown> | null;
    cancelTx: Record<string, unknown> | null;
    srcChainId: number;
    dstChainId: number;
    cancelable: boolean;
    takerAsset: string;
    timeLocks: string;
}

export interface OrdersByHashesInput {
    orderHashes: string[];
}
// #endregion

// #endregion
