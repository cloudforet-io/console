import { defineStore } from 'pinia';

interface CollectorFormState {
    selectedCollector: any; // TODO: CollectorPlugin Model
}

type CollectorFormGetter = any;
type CollectorFormAction = any;

export const useCollectorFormStore = defineStore<string, CollectorFormState, CollectorFormGetter, CollectorFormAction>('collector-form', {
    state: () => ({
        selectedCollector: null,
    }),
    actions: {
        setSelectedCollector(collector: any) {
            this.selectedCollector = collector;
        },
    },
});
