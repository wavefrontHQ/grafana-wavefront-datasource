export class WavefrontQueryOptionsCtrl {
    static templateUrl = "partials/query.options.html";

    public summarizations = ["mean", "median", "min", "max", "sum", "count", "last", "first"];
    public granularities = ["second", "minute", "hour", "day"];

    public panelCtrl: any;

    constructor() {
        const panel = this.panelCtrl.panel;

        // scopedVars is the old (and broken) way of doing this. backwards compatible.
        const scopedVars = panel.scopedVars || {};

        panel.summarization = panel.summarization || scopedVars.summarization || this.summarizations[0];
        panel.granularity = panel.granularity || scopedVars.granularity || this.granularities[0];
        panel.includeObsolete = panel.includeObsolete || scopedVars.includeObsolete || false;

        this.summarizations = this.summarizations.sort();
    }

    public refresh() {
        const panel = this.panelCtrl.panel;
        const targets = panel.targets;
        for (let i = 0; i < targets.length; i++) {
            targets[i].summarization = panel.summarization;
            targets[i].granularity = panel.granularity;
            targets[i].includeObsolete = panel.includeObsolete;
        }
        this.panelCtrl.refresh();
    }
}
