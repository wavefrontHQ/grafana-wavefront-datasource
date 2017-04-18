export default class BackendSrvCancelledRetriesDecorator {
    private undecoratedBackendSrv;
    private attempts;
    private $q;
    constructor(undecoratedBackendSrv: any, $q: any, attempts?: number);
    datasourceRequest(reqConfig: any): any;
    private retryPromise(promise, attempts);
}
