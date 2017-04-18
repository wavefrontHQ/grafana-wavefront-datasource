declare module "app/plugins/sdk" {
    export class QueryCtrl {
        public static templateUrl: string;
        public target: any;
        public datasource: any;
        public panelCtrl: any;

        constructor(...args: any[]);

        public refresh();
    }
}

declare module "app/core/utils/kbn" {
    export function interval_to_seconds(str: string): number;
}

// tslint:disable-next-line:interface-name
interface Window {
    grafanaBootData: any;
}
