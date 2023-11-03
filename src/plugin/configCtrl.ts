export class WavefrontConfigCtrl {
    static templateUrl = "partials/config.html";

    public current: any;
    public wavefrontTokenExists = false;
    public cspApiTokenExists = false;

    constructor() {
        this.wavefrontTokenExists = (this.current.jsonData.wavefrontToken != null && this.current.jsonData.wavefrontToken !== "");
        this.cspApiTokenExists = (this.current.jsonData.cspAPIToken != null && this.current.jsonData.cspAPIToken !== "");
    }

    public resetWavefrontToken() {
        this.current.jsonData.wavefrontToken = "";
        this.wavefrontTokenExists = false;
    }
    
    public resetCspApiToken() {
        this.current.jsonData.cspAPIToken = "";
        this.cspApiTokenExists = false;
    }
}
