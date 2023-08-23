import type { Store } from 'vuex';

declare module '@vue/runtime-core' {
    interface App {
        $store: Store<any>
    }
    interface ComponentCustomProperties {
        $store: Store<any>
    }
}
