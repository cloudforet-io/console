import { defineStore } from 'pinia';

import type { Tag } from '@/common/components/forms/tags-input-group/type';

import type {
    CollectorModel,
    RepositoryPluginModel,
} from '@/services/asset-inventory/collector/type';

type AttachedServiceAccount = string[]; // TODO: need to check type

export const useCollectorFormStore = defineStore('collector-form', {
    state: () => ({
        originCollector: null as CollectorModel|null, // data from inventory.collector.get api.
        repositoryPlugin: null as RepositoryPluginModel|null, // data from repository.plugin.list api. it's used when creating collector.
        provider: null as string|null,
        tags: {} as Tag,
        name: '',
        version: '' as string,
        autoUpgrade: false,
        scheduleHours: [] as number[],
        schedulePower: false,
        attachedServiceAccount: null as AttachedServiceAccount|null,
    }),
    getters: {
        collectorId(): string|undefined {
            return this.originCollector?.collector_id;
        },
        pluginId(): string|undefined {
            return this.originCollector?.plugin_info.plugin_id ?? this.repositoryPlugin?.plugin_id;
        },
    },
    actions: {
        setOriginCollector(collector: CollectorModel) {
            this.originCollector = collector;
            this.resetForm();
        },
        setRepositoryPlugin(pluginInfo: RepositoryPluginModel|null) {
            this.repositoryPlugin = pluginInfo;
        },
        resetForm() {
            this.setTags(this.originCollector?.tags ?? {});
            this.resetName();
            this.resetVersion();
            this.resetSchedule();
            // TODO: set attached service account from origin data
        },
        setProvider(provider: string) {
            this.provider = provider;
        },
        setTags(tags: Tag) {
            this.tags = tags;
        },
        setName(name: string) {
            this.name = name;
        },
        resetName() {
            this.name = this.originCollector?.name ?? '';
        },
        setVersion(version: string) {
            this.version = version;
        },
        setAutoUpgrade(autoUpgrade: boolean) {
            this.autoUpgrade = autoUpgrade;
        },
        resetVersion() {
            const pluginVersion = this.originCollector?.plugin_info?.version ?? this.repositoryPlugin?.version ?? '';
            const pluginUpgradeMode = this.originCollector?.plugin_info.upgrade_mode ?? 'AUTO';
            this.setVersion(pluginVersion);
            this.setAutoUpgrade(pluginUpgradeMode === 'AUTO');
        },
        resetSchedule(hoursOnly = false) {
            this.scheduleHours = this.originCollector?.schedule?.hours ?? [];
            if (!hoursOnly) this.schedulePower = this.originCollector?.state === 'ENABLED' ?? false;
        },
        setAttachedServiceAccount(serviceAccount: AttachedServiceAccount|null) {
            if (!serviceAccount?.length) this.attachedServiceAccount = null;
            else this.attachedServiceAccount = serviceAccount;
        },
    },
});
