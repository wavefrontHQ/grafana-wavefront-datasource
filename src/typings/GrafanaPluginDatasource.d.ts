interface IGrafanaPluginDatasource {
    query: (GrafanaPluginDataSourceQueryOptions) => angular.IPromise<ITimeSeriesResponse[] | ITableResponse[] | IEmptyResponse>;
    testDatasource: () => angular.IPromise<boolean>;
    annotationQuery: (GrafanaPluginDataSourceAnnotationOptions) => angular.IPromise<IAnnotationResponse[]>;
    metricFindQuery: (options: any) => any;
}

/* Generic Types */
interface IRange {
    from: string;
    to: string;
}

/* Query Types */
interface ITargets {
    refId: string;
    target: string;
    wfQuery: any;
    hide: any;
    errors: any;
    warnings: any;
}

interface IGrafanaPluginDataSourceQueryOptions {
    range: IRange;
    interval: String;
    targets: ITargets[];
    format: String;
    maxDataPoints: number;
    scopedVars: any;
}

interface ITimeSeriesResponse {
    target: string;
    datapoints: [number[]];
}

interface ITableResponse {
    colums: ITableResponseColumnDescriptions[];
    rows: [number[]];
    type: string;
}

interface ITableResponseColumnDescriptions {
    text: string;
    type?: string;
    sort?: boolean;
    desc?: boolean;
}

interface IEmptyResponse {
    data: any[];
}

/* Annotation Types */
interface IGrafanaPluginDataSourceAnnotationOptions {
    range: IRange;
    rangeRaw: IRangeRaw;
    annotation: IAnnotation;
}

interface IRangeRaw {
    from: string;
    to: string;
}

interface IAnnotation {
    query: any;
    iconColor: string;
    datasource: string;
    enable: boolean;
    name: string;
    limit: number;
}

interface IAnnotationResponse {
    annotation: IAnnotation;
    title: string;
    time: number;
    text: string;
    tags: string;
}
