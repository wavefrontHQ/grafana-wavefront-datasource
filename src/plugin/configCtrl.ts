export class WavefrontConfigCtrl {
    static templateUrl = "partials/config.html";

    public current: any;
    public wavefrontTokenExists = false;
    public cspApiTokenExists = false;
    public cspOAuthExists = false;

    constructor() {
        this.wavefrontTokenExists = (this.current.jsonData.wavefrontToken != null && this.current.jsonData.wavefrontToken !== "");
        this.cspApiTokenExists = (this.current.jsonData.cspAPIToken != null && this.current.jsonData.cspAPIToken !== "");
        this.cspOAuthExists = (this.current.jsonData.cspOAuthClientId != null && this.current.jsonData.cspOAuthClientSecret !== "");
    }

    public resetWavefrontToken() {
        this.current.jsonData.wavefrontToken = "";
        this.wavefrontTokenExists = false;
    }
    
    public resetCspApiToken() {
        this.current.jsonData.cspAPIToken = "";
        this.cspApiTokenExists = false;
    }

    public resetCspOAuth() {
        this.current.jsonData.cspOAuthClientId = "";
        this.current.jsonData.cspOAuthClientSecret = "";
        this.cspOAuthExists = false;
    }
}
