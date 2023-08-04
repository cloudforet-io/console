import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    CollectorModel, CollectorOptions,
    RepositoryPluginModel,
} from '@/services/asset-inventory/collector/model';


export type AttachedServiceAccount = FilterableDropdownMenuItem[];

export type AttachedServiceAccountType = 'all'|'specific';

export type ServiceAccountFilterOption = 'include'|'exclude';

export const useCollectorFormStore = defineStore('collector-form', {
    state: () => ({
        originCollector: null as CollectorModel|null, // data from inventory.collector.get api.
        repositoryPlugin: null as RepositoryPluginModel|null, // data from repository.plugin.list api. it's used when creating collector.
        provider: null as string|null,
        tags: {} as Tag,
        name: '',
        version: '' as string,
        autoUpgrade: true,
        scheduleHours: [] as number[],
        schedulePower: false,
        attachedServiceAccount: [] as AttachedServiceAccount,
        attachedServiceAccountType: 'all' as AttachedServiceAccountType,
        selectedServiceAccountFilterOption: 'include' as ServiceAccountFilterOption,
        options: {} as CollectorOptions,
        versions: [] as string[],
    }),
    getters: {
        collectorId(): string|undefined {
            return this.originCollector?.collector_id;
        },
        pluginId(): string|undefined {
            return this.originCollector?.plugin_info?.plugin_id ?? this.repositoryPlugin?.plugin_id;
        },
        collectorProvider(): string|undefined {
            return this.originCollector?.provider;
        },
        serviceAccounts(): string[] {
            return this.attachedServiceAccount.map((d) => d.name as string);
        },
    },
    actions: {
        async setOriginCollector(collector: CollectorModel) {
            this.originCollector = collector;
            await this.resetForm();
        },
        setRepositoryPlugin(pluginInfo: RepositoryPluginModel|null) {
            this.repositoryPlugin = pluginInfo;
        },
        async resetForm() {
            this.resetName();
            this.resetTags();
            this.resetVersion();
            this.resetSchedule();
            this.resetOptions();
            await this.resetAttachedServiceAccount();
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
        async resetAttachedServiceAccount() {
            await store.dispatch('reference/serviceAccount/load');
            const accountItems = store.getters['reference/serviceAccountItems'];
            const secretFilter = this.originCollector?.secret_filter;
            const attachedServiceAccount = this.selectedServiceAccountFilterOption === 'include' ? secretFilter?.service_accounts : secretFilter?.exclude_service_accounts;
            this.attachedServiceAccount = (attachedServiceAccount ?? []).map((d) => ({
                label: accountItems[d]?.label ?? d,
                name: d,
            })) ?? [];
            this.attachedServiceAccountType = this.originCollector?.secret_filter?.state === 'ENABLED' ? 'specific' : 'all';
        },
        setOptions(options: CollectorOptions) {
            this.options = options;
        },
        resetOptions() {
            this.options = this.originCollector?.plugin_info?.options ?? {};
        },
        async getVersions(pluginId: string) {
            try {
                const res = await SpaceConnector.client.repository.plugin.getVersions({
                    plugin_id: pluginId,
                });
                this.versions = res.results;
            } catch (e) {
                this.versions = [];
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'));
            }
        },
    },
});
