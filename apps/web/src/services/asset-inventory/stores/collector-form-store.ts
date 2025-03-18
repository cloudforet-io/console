import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CollectorRuleListParameters } from '@/schema/inventory/collector-rule/api-verbs/list';
import type { CollectorRuleModel } from '@/schema/inventory/collector-rule/model';
import type {
    CollectorModel,

} from '@/schema/inventory/collector/model';
import type { CollectorOptions } from '@/schema/inventory/collector/type';
import type { PluginGetVersionsParameters } from '@/schema/repository/plugin/api-verbs/get-versions';
import type { PluginModel } from '@/schema/repository/plugin/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { Tag } from '@/common/modules/tags/type';

/**
 * @name useCollectorDataModalStore
 * @description This directory contains the forms used by the collector service(create or update).
 *              By default, the forms use "Save Collector Form" internally. So if you want to use form components, the store should be initialized.
 * @example
 * ```ts
 * import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
 *
 * const collectorFormStore = useCollectorFormStore();
 * ```
 */
export type AttachedServiceAccount = SelectDropdownMenuItem[];

export type AttachedServiceAccountType = 'all'|'specific';

export type ServiceAccountFilterOption = 'include'|'exclude';

export const useCollectorFormStore = defineStore('collector-form', () => {
    const state = reactive({
        originCollector: null as CollectorModel|null, // data from inventory.collector.get api.
        repositoryPlugin: null as PluginModel|null, // data from repository.plugin.list api. it's used when creating collector.
        provider: undefined as string|undefined,
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
        isScheduleError: false,

        // additional rules form
        originCollectorRules: [] as CollectorRuleModel[]|null,
        additionalRules: [] as CollectorRuleModel[],

        // getters
        collectorId: computed<string|undefined>(() => state.originCollector?.collector_id),
        pluginId: computed<string|undefined>(() => state.originCollector?.plugin_info?.plugin_id ?? state.repositoryPlugin?.plugin_id),
        collectorProvider: computed<string|undefined>(() => state.originCollector?.provider),
        serviceAccounts: computed<string[]>(() => state.attachedServiceAccount.map((d) => d.name as string)),
    });

    const actions = {
        async setOriginCollector(collector: CollectorModel) {
            state.originCollector = collector;
            await this.resetForm();
        },
        setRepositoryPlugin(pluginInfo: PluginModel|null) {
            state.repositoryPlugin = pluginInfo;
        },
        async setOriginCollectorRules(id?: string) {
            try {
                const res = await SpaceConnector.clientV2.inventory.collectorRule.list<CollectorRuleListParameters, ListResponse<CollectorRuleModel>>({
                    collector_id: state.originCollector?.collector_id ?? id,
                });
                state.originCollectorRules = res?.results ?? [];
                state.additionalRules = state.originCollectorRules;
            } catch (e) {
                state.originCollectorRules = [];
                state.additionalRules = [];
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_GET_RULE_TITLE'));
            }
        },
        async resetForm() {
            actions.resetName();
            actions.resetTags();
            actions.resetVersion();
            actions.resetSchedule();
            actions.resetOptions();
            await this.resetAttachedServiceAccount();
        },
        setProvider(provider: string) {
            state.provider = provider;
        },
        setTags(tags: Tag) {
            state.tags = tags;
        },
        resetTags() {
            state.tags = state.originCollector?.tags ?? {};
        },
        setName(name: string) {
            state.name = name;
        },
        resetName() {
            state.name = state.originCollector?.name ?? '';
        },
        setVersion(version: string) {
            state.version = version;
        },
        resetVersion() {
            state.version = state.originCollector?.plugin_info?.version ?? '';
        },
        setAutoUpgrade(autoUpgrade: boolean) {
            state.autoUpgrade = autoUpgrade;
        },
        resetAutoUpgrade() {
            const pluginUpgradeMode = state.originCollector?.plugin_info.upgrade_mode ?? 'AUTO';
            state.autoUpgrade = pluginUpgradeMode === 'AUTO';
        },
        resetSchedule(hoursOnly = false) {
            state.scheduleHours = state.originCollector?.schedule?.hours ?? [];
            state.isScheduleError = false;
            if (!hoursOnly) state.schedulePower = state.originCollector?.schedule?.state === 'ENABLED';
        },
        resetSchedulePower() {
            state.schedulePower = state.originCollector?.schedule?.state === 'ENABLED';
        },
        async resetAttachedServiceAccount() {
            const allReferenceStore = useAllReferenceStore();
            const accountItems = allReferenceStore.getters.serviceAccount;
            const secretFilter = state.originCollector?.secret_filter;
            const attachedServiceAccount = state.selectedServiceAccountFilterOption === 'include' ? secretFilter?.service_accounts : secretFilter?.exclude_service_accounts;
            state.attachedServiceAccount = (attachedServiceAccount ?? []).map((d) => ({
                label: accountItems[d]?.label ?? d,
                name: d,
            })) ?? [];
            state.attachedServiceAccountType = state.originCollector?.secret_filter?.state === 'ENABLED' ? 'specific' : 'all';
        },
        setOptions(options: CollectorOptions) {
            state.options = options;
        },
        resetOptions() {
            state.options = state.originCollector?.plugin_info?.options ?? {};
        },
        async getVersions(pluginId: string) {
            try {
                const res = await SpaceConnector.clientV2.repository.plugin.getVersions<PluginGetVersionsParameters, ListResponse<string> >({
                    plugin_id: pluginId,
                });
                state.versions = res.results ?? [];
            } catch (e) {
                state.versions = [];
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'));
            }
        },
        resetState() {
            state.originCollector = null;
            state.repositoryPlugin = null;
            state.provider = undefined;
            state.tags = {};
            state.name = '';
            state.version = '';
            state.autoUpgrade = true;
            state.scheduleHours = [];
            state.schedulePower = false;
            state.attachedServiceAccount = [];
            state.attachedServiceAccountType = 'all';
            state.selectedServiceAccountFilterOption = 'include';
            state.options = {};
            state.additionalRules = [];
            state.versions = [];
            state.isScheduleError = false;
        },
    };

    return {
        state,
        ...actions,
    };
});
