import type { Store } from 'vuex';

declare module '@vue/runtime-core' {
    // Declare your own store states.
    interface State {
        count: number
    }
    interface App {
        $store: Store<State>
    }
    interface ComponentCustomProperties {
        $store: Store<State>
    }
}
