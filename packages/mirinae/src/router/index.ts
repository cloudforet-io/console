import type VueRouter from 'vue-router';

export class RouterConnector {
    private static _router: VueRouter;

    static get router() {
        return RouterConnector._router;
    }

    static set router(_router: VueRouter) {
        RouterConnector._router = _router;
    }
}
