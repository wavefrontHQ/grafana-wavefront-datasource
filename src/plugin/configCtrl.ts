export class WavefrontConfigCtrl {
    static templateUrl = "partials/config.html";

    public current: any;
    public wavefrontTokenExists = false;

    constructor() {
        this.wavefrontTokenExists = (this.current.jsonData.wavefrontToken != null && this.current.jsonData.wavefrontToken !== "");
    }

    public resetWavefrontToken() {
        this.current.jsonData.wavefrontToken = "";
        this.wavefrontTokenExists = false;
    }
}
