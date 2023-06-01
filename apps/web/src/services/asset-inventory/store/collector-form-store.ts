import { defineStore } from 'pinia';

import type { CollectorModel, CollectorPluginModel } from '@/services/asset-inventory/collector/type';

type AttachedServiceAccount = string[]|null; // TODO: need to check type

interface CollectorFormState {
    originCollector: CollectorModel|null;
    pluginInfo: CollectorPluginModel|null;
    attachedServiceAccount: AttachedServiceAccount;
}

type CollectorFormGetter = any;
type CollectorFormAction = any;

export const useCollectorFormStore = defineStore<string, CollectorFormState, CollectorFormGetter, CollectorFormAction>('collector-form', {
    state: () => ({
        originCollector: null,
        pluginInfo: null,
        attachedServiceAccount: null,
    }),
    actions: {
        setOriginCollector(collector: CollectorModel) {
            this.originCollector = collector;
        },
        setPluginInfo(pluginInfo: CollectorPluginModel) {
            this.pluginInfo = pluginInfo;
        },
        setAttachedServiceAccount(serviceAccount: AttachedServiceAccount) {
            if (!serviceAccount?.length) this.attachedServiceAccount = null;
            else this.attachedServiceAccount = serviceAccount;
        },
    },
});
