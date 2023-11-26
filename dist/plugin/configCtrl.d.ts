export declare class WavefrontConfigCtrl {
    static templateUrl: string;
    current: any;
    wavefrontTokenExists: boolean;
    cspApiTokenExists: boolean;
    cspOAuthExists: boolean;
    constructor();
    resetWavefrontToken(): void;
    resetCspApiToken(): void;
    resetCspOAuth(): void;
}
