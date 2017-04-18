/**
 * Chrome has an issue where when you issue a ton of requests (XHR/fetch/jsonp), you can create so many requests you
 * get bigger then the request counter and it just starts canceling your requests. There doesn't seem to be any way around
 * this in JS, but retrying appears to mask the end user issues.
 */

/**
 * The number of ms under which we consider a request randomly killed by Chrome.
 *
 * Without this check, desired timeouts (admin-configured timeouts) will be flagged for this retry which should instead be handled by
 * the undecorated BackendSrv
 */
const CHROME_RANDOM_CANCEL_THRESHOLD = 1000;

export default class BackendSrvCancelledRetriesDecorator {
    private undecoratedBackendSrv;
    private attempts: number;
    private $q;

    constructor(undecoratedBackendSrv, $q, attempts = 10) {
        this.undecoratedBackendSrv = undecoratedBackendSrv;
        this.attempts = attempts;
        this.$q = $q;
    }

    public datasourceRequest(reqConfig: any) {
        const issueRequest = () => this.undecoratedBackendSrv.datasourceRequest({
            ...reqConfig,
            issueTime: Date.now(),
        });
        return this.retryPromise(issueRequest, this.attempts);
    }

    private retryPromise(promise: () => angular.IPromise<any>, attempts: number) {
        return promise()
            .catch((result) => {
                const timeInFlight = Date.now() -result.err.config.issueTime;
                const shouldRetry =
                    result.cancelled &&
                    timeInFlight < CHROME_RANDOM_CANCEL_THRESHOLD &&
                    attempts > 0;

                return shouldRetry
                    ? this.retryPromise(promise, attempts--)
                    : this.$q.reject(result);
            }
            );
    }
}
