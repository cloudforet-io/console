import { defineStore } from 'pinia';

interface CollectorFormState {
    originCollector: any; // TODO: CollectorPlugin Model
}

type CollectorFormGetter = any;
type CollectorFormAction = any;

export const useCollectorFormStore = defineStore<string, CollectorFormState, CollectorFormGetter, CollectorFormAction>('collector-form', {
    state: () => ({
        originCollector: null,
    }),
    actions: {
        setOriginCollector(collector: any) {
            this.originCollector = collector;
        },
    },
});
