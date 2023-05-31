import { defineStore } from 'pinia';

type AttachedServiceAccount = string[]|null; // TODO: need to check type

interface CollectorFormState {
    originCollector: any; // TODO: CollectorPlugin Model
    attachedServiceAccount: AttachedServiceAccount;
}

type CollectorFormGetter = any;
type CollectorFormAction = any;

export const useCollectorFormStore = defineStore<string, CollectorFormState, CollectorFormGetter, CollectorFormAction>('collector-form', {
    state: () => ({
        originCollector: null,
        attachedServiceAccount: null,
    }),
    actions: {
        setOriginCollector(collector: any) {
            this.originCollector = collector;
        },
        setAttachedServiceAccount(serviceAccount: AttachedServiceAccount) {
            if (!serviceAccount || !serviceAccount.length) this.attachedServiceAccount = null;
            else this.attachedServiceAccount = serviceAccount;
        },
    },
});
