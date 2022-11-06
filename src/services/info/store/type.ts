import type { Store } from 'vuex';

// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface InfoState {
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type InfoStore = Store<InfoState& {}>;
