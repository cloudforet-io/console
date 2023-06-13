import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import { defineStore } from 'pinia';

import type { Tag } from '@/common/components/forms/tags-input-group/type';

import type {
    CollectorModel, CollectorOptions,
    RepositoryPluginModel,
} from '@/services/asset-inventory/collector/model';

export type AttachedServiceAccount = FilterableDropdownMenuItem[];

export type AttachedServiceAccountType = 'all'|'specific';

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
        attachedServiceAccount: [] as AttachedServiceAccount,
        attachedServiceAccountType: 'all' as AttachedServiceAccountType,
        options: {} as CollectorOptions,
    }),
    getters: {
        collectorId(): string|undefined {
            return this.originCollector?.collector_id;
        },
        pluginId(): string|undefined {
            return this.originCollector?.plugin_info.plugin_id ?? this.repositoryPlugin?.plugin_id;
        },
        collectorProvider(): string|undefined {
            return this.originCollector?.provider;
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
            this.resetName();
            this.resetTags();
            this.resetVersion();
            this.resetSchedule();
            this.resetAttachedServiceAccount();
            this.resetOptions();
        },
        setProvider(provider: string) {
            this.provider = provider;
        },
        setTags(tags: Tag) {
            this.tags = tags;
        },
        resetTags() {
            this.tags = this.originCollector?.tags ?? {};
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
        resetVersion() {
            this.version = this.originCollector?.plugin_info?.version ?? this.repositoryPlugin?.version ?? '';
        },
        setAutoUpgrade(autoUpgrade: boolean) {
            this.autoUpgrade = autoUpgrade;
        },
        resetAutoUpgrade() {
            const pluginUpgradeMode = this.originCollector?.plugin_info.upgrade_mode ?? 'AUTO';
            this.autoUpgrade = pluginUpgradeMode === 'AUTO';
        },
        resetSchedule(hoursOnly = false) {
            this.scheduleHours = this.originCollector?.schedule?.hours ?? [];
            if (!hoursOnly) this.schedulePower = this.originCollector?.schedule?.state === 'ENABLED' ?? false;
        },
        resetSchedulePower() {
            this.schedulePower = this.originCollector?.schedule?.state === 'ENABLED' ?? false;
        },
        resetAttachedServiceAccount() {
            this.attachedServiceAccount = this.originCollector?.secret_filter?.service_accounts ?? [];
            this.attachedServiceAccountType = this.originCollector?.secret_filter?.state === 'ENABLED' ? 'specific' : 'all';
        },
        setOptions(options: CollectorOptions) {
            this.options = options;
        },
        resetOptions() {
            this.options = this.originCollector?.plugin_info?.options ?? {};
        },
    },
});
