import { defineStore } from 'pinia';

import type { Tag } from '@/common/components/forms/tags-input-group/type';

import type { CollectorModel, CollectorPluginModel } from '@/services/asset-inventory/collector/type';

type AttachedServiceAccount = string[]; // TODO: need to check type

export const useCollectorFormStore = defineStore('collector-form', {
    state: () => ({
        originCollector: null as CollectorModel|null,
        pluginInfo: null as CollectorPluginModel|null,
        tags: {} as Tag,
        name: '',
        version: '',
        autoUpdate: false,
        scheduleHours: [] as string[],
        schedulePower: false,
        attachedServiceAccount: null as AttachedServiceAccount|null,
    }),
    actions: {
        setOriginCollector(collector: CollectorModel) {
            this.originCollector = collector;
            this.resetForm();
        },
        resetForm() {
            const collector = this.originCollector;
            this.pluginInfo = collector?.plugin_info ?? null;
            this.tags = collector?.tags ?? {};
            this.version = collector?.plugin_info.version ?? '';
            this.autoUpdate = collector?.plugin_info.upgrade_mode === 'AUTO' ?? false;
            this.resetSchedule();
            // TODO: set attached service account from origin data
        },
        setPluginInfo(pluginInfo: CollectorPluginModel) {
            this.pluginInfo = pluginInfo;
        },
        setTags(tags: Tag) {
            this.tags = tags;
        },
        setName(name: string) {
            this.name = name;
        },
        setVersion(version: string, autoUpdate: boolean) {
            this.version = version;
            this.autoUpdate = autoUpdate;
        },
        resetSchedule(hoursOnly = false) {
            this.scheduleHours = this.originCollector?.schedule.hours ?? [];
            if (!hoursOnly) this.schedulePower = this.originCollector?.state === 'ENABLED' ?? false;
        },
        setAttachedServiceAccount(serviceAccount: AttachedServiceAccount|null) {
            if (!serviceAccount?.length) this.attachedServiceAccount = null;
            else this.attachedServiceAccount = serviceAccount;
        },
    },
});
