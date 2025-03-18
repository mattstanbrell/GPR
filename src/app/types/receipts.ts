
export type Item = {
    name: string;
    quantity: number;
    cost: number;
};

export type AnalysisResult = {
    total: string;
    items: Item[];
    timeTaken: number;
    cost: number;
    tokenInfo?: {
        inputTokens: number;
        outputTokens: number;
    };
};

export type AnalysisError = {
    error: string;
};

export type ModelResult = AnalysisResult | AnalysisError;