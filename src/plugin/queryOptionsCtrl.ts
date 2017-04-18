export class WavefrontQueryOptionsCtrl {
    static templateUrl = "partials/query.options.html";

    public summarizations = ["mean", "median", "min", "max", "sum", "count", "last", "first"];
    public granularities = ["second", "minute", "hour", "day"];

    public panelCtrl: any;

    constructor() {
        const scopedVars = this.panelCtrl.panel.scopedVars || {};
        scopedVars.summarization = scopedVars.summarization || this.summarizations[0];
        scopedVars.granularity = scopedVars.granularity || this.granularities[0];
        scopedVars.includeObsolete = scopedVars.includeObsolete || false;
        this.panelCtrl.panel.scopedVars = scopedVars;

        this.summarizations = this.summarizations.sort();
    }
}
