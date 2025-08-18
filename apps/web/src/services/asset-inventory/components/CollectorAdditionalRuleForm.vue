<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PRadio, PSelectDropdown, PI, PTextInput, PToggleButton, PFieldGroup, PCheckbox, PFieldTitle, PTooltip,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CloudServiceTypeStatParameters } from '@/api-clients/inventory/cloud-service-type/schema/api-verbs/stat';
import {
    COLLECTOR_RULE_CONDITION_KEY, COLLECTOR_RULE_CONDITION_KEY_LABEL,
    COLLECTOR_RULE_CONDITION_POLICY,
} from '@/api-clients/inventory/collector-rule/schema/constant';
import type { AdditionalRuleCondition, CollectorRuleModel, AdditionalRuleAction } from '@/api-clients/inventory/collector-rule/schema/model';
import type {
    CollectorRuleConditionKey,
    CollectorRuleConditionOperator,
    CollectorRuleConditionPolicy,
} from '@/api-clients/inventory/collector-rule/schema/type';
import type { RegionListParameters } from '@/api-clients/inventory/region/schema/api-verbs/list';
import type { RegionModel } from '@/api-clients/inventory/region/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';
import WorkspaceSelectDropdown from '@/common/modules/workspace/WorkspaceSelectDropdown.vue';

import CollectorAdditionalRuleFormOperatorDropdown
    from '@/services/asset-inventory/components/CollectorAdditionalRuleFormOperatorDropdown.vue';
import type { CollectorRuleForm } from '@/services/asset-inventory/types/type';

type ActionPolicy = keyof AdditionalRuleAction;

interface Props {
    data?: CollectorRuleModel;
    provider?: string;
}
const props = withDefaults(defineProps<Props>(), {
    data: undefined,
    provider: undefined,
});

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();

const emit = defineEmits<{(e: 'click-done', formData?: CollectorRuleForm): void;
    (e: 'click-cancel'): void;
}>();

const DEFAULT_CONDITION_KEY = props.provider ? COLLECTOR_RULE_CONDITION_KEY.cloud_service_group : COLLECTOR_RULE_CONDITION_KEY.provider;

interface AdditionalRuleConditionWithSubkey extends AdditionalRuleCondition {
    subkey?: string;
}
const convertToUiCondition = (condition?:AdditionalRuleCondition[]):AdditionalRuleConditionWithSubkey[] => {
    const targetCondition = !condition?.length ? [{
        key: DEFAULT_CONDITION_KEY,
        subkey: '',
        operator: 'eq',
        value: '',
    }] : condition;
    return targetCondition.map((c) => {
        if (c.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data) || c.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)) {
            return {
                ...c,
                key: c.key.split('.')[0] ?? c.key,
                subkey: c.key.slice(4),
            };
        }
        return c;
    });
};

const convertToApiCondition = (condition:AdditionalRuleConditionWithSubkey[]):AdditionalRuleCondition[] => condition.map((c) => {
    if (c.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data) || c.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)) {
        return {
            key: `${c.key}.${c.subkey}`,
            operator: c.operator,
            value: c.value,
        };
    }
    delete c.subkey;
    return c;
});

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    workspace: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    provider: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    isConditionTooltipVisible: computed(() => {
        let isConditionTooltipVisible = false;
        state.conditionList.forEach((condition) => {
            if (condition.key === COLLECTOR_RULE_CONDITION_KEY.data || condition.key === COLLECTOR_RULE_CONDITION_KEY.tags) {
                isConditionTooltipVisible = true;
            }
        });
        return isConditionTooltipVisible;
    }),
    conditionPolicies: computed(() => ({
        [COLLECTOR_RULE_CONDITION_POLICY.ALL]: i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALL'),
        [COLLECTOR_RULE_CONDITION_POLICY.ANY]: i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ANY'),
    })),
    selectedConditionRadioIdx: props.data?.conditions_policy ?? COLLECTOR_RULE_CONDITION_POLICY.ALL as CollectorRuleConditionPolicy,
    conditionKeyMenu: computed<SelectDropdownMenuItem[]>(() => {
        let keys = Object.keys(COLLECTOR_RULE_CONDITION_KEY);
        if (props.provider) keys = keys.filter((key) => key !== COLLECTOR_RULE_CONDITION_KEY.provider);
        return keys.filter((key) => (!((key === 'data' || key === 'tags')))).map((key) => ({
            label: COLLECTOR_RULE_CONDITION_KEY_LABEL[key],
            name: key,
        })).concat([
            { label: 'Data', name: 'data' },
            { label: 'Tags', name: 'tags' },
        ]);
    }),
    conditionList: convertToUiCondition(props.data?.conditions),
    valueMenuSearchKeyword: '',
    searchLoading: true,
    conditionState: !!(props.data?.conditions_policy === 'ALWAYS'),
    // select dropdown menu
    conditionListKey: 0,
    cloudServiceGroupMenu: [] as (SelectDropdownMenuItem[])[],
    cloudServiceTypeMenu: [] as (SelectDropdownMenuItem[])[],
    regionMenu: [] as (SelectDropdownMenuItem[])[],
    // actions
    actionPolicies: computed<Partial<Record<ActionPolicy, TranslateResult>>>(() => {
        if (!state.isAdminMode) {
            return ({
                change_project: i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.SELECT_PROJECT'),
                match_project: i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.MATCH_PROJECT'),
                match_service_account: i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.MATCH_SERVICE_ACCOUNT'),
            });
        }
        return ((state.conditionState) ? ({
            match_project: i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.MATCH_PROJECT'),
            match_service_account: i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.MATCH_SERVICE_ACCOUNT'),
        }) : ({
            change_project: i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.SELECT_PROJECT'),
        }));
    }),
    selectedActionRadioIdx: 'change_project' as ActionPolicy,
    selectedProjectId: props.data?.actions?.change_project ? [props.data?.actions?.change_project ?? ''] : undefined,
    selectedWorkspaceId: [] as SelectDropdownMenuItem[],
    isStopProcessingChecked: props.data?.options?.stop_processing ?? false,
    sourceInput: '',
    targetInput: '',
    isAllValid: computed(() => {
        if (!state.conditionState) {
            const isConditionValid = state.conditionList.every((condition) => condition.key && condition.value);
            if (!isConditionValid) {
                return false;
            }
        }
        if (state.selectedActionRadioIdx === 'change_project' && !state.selectedProjectId?.[0]) {
            return false;
        }
        if (state.selectedActionRadioIdx !== 'change_project' && (!state.sourceInput || !state.targetInput)) {
            return false;
        }

        return true;
    }),
    initLoading: false,
});
const valueDropdownMenu = (key: CollectorRuleConditionKey, idx:number) => {
    if (key === COLLECTOR_RULE_CONDITION_KEY.cloud_service_group) {
        return state.cloudServiceGroupMenu[idx] ?? DEFAULT_SEARCH_MAP.cloud_service_group ?? [];
    } if (key === COLLECTOR_RULE_CONDITION_KEY.cloud_service_type) {
        return state.cloudServiceTypeMenu[idx] ?? DEFAULT_SEARCH_MAP.cloud_service_type ?? [];
    } if (key === COLLECTOR_RULE_CONDITION_KEY.region_code) {
        return state.regionMenu[idx] ?? DEFAULT_SEARCH_MAP.region_code ?? [];
    } if (key === COLLECTOR_RULE_CONDITION_KEY.provider) {
        return state.provider ? Object.keys(state.provider).map((provider) => ({
            label: state.provider[provider].name,
            name: provider,
        })) : [];
    }
    return [];
};
const handleClickAddRule = () => {
    state.conditionList.push({
        key: DEFAULT_CONDITION_KEY,
        operator: 'eq',
        value: '',
    });
};
const handleClickDeleteCondition = (idx:number) => {
    state.conditionList = state.conditionList.filter((condition, index) => index !== idx);
};

const handleSelectConditionValue = (value:string, idx:number) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === idx) {
            return {
                ...condition,
                value,
            };
        }
        return condition;
    });
};
const handleSelectConditionKey = (value:CollectorRuleConditionKey, idx:number) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === idx) {
            return {
                ...condition,
                key: value,
                value: '',
            };
        }
        return condition;
    });
    switch (value) {
    case COLLECTOR_RULE_CONDITION_KEY.cloud_service_group:
        state.cloudServiceGroupMenu[idx] = DEFAULT_SEARCH_MAP.cloud_service_group;
        break;
    case COLLECTOR_RULE_CONDITION_KEY.cloud_service_type:
        state.cloudServiceTypeMenu[idx] = DEFAULT_SEARCH_MAP.cloud_service_type;
        break;
    case COLLECTOR_RULE_CONDITION_KEY.region_code:
        state.regionMenu[idx] = DEFAULT_SEARCH_MAP.region_code;
        break;
    default:
        break;
    }
};
const handleUpdateSubkeyInput = (value:string, idx:number) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === idx) {
            return {
                ...condition,
                subkey: value,
            };
        }
        return condition;
    });
};

const handleUpdateValueInput = (value:string, idx:number) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === idx) {
            return {
                ...condition,
                value,
            };
        }
        return condition;
    });
};

const handleUpdateOperator = (value:CollectorRuleConditionOperator, idx:number) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === idx) {
            return {
                ...condition,
                operator: value,
            };
        }
        return condition;
    });
};

const handleClickCancel = () => {
    emit('click-cancel');
};

const handleSelectProjectId = (value:string[]) => {
    state.selectedProjectId = value;
};

const handleSelectWorkspaceId = (value:SelectDropdownMenuItem[]) => {
    state.selectedWorkspaceId = value;
    state.selectedProjectId = undefined;
};
const handleClickDone = () => {
    const actions:AdditionalRuleAction = {};

    if (state.selectedActionRadioIdx === 'change_project') {
        actions.change_project = state.selectedProjectId?.[0];
    } else if (state.selectedActionRadioIdx === 'match_project') {
        actions.match_project = {
            source: state.sourceInput,
            target: state.targetInput,
        };
    } else if (state.selectedActionRadioIdx === 'match_service_account') {
        actions.match_service_account = {
            source: state.sourceInput,
            target: state.targetInput,
        };
    }

    emit('click-done', {
        collector_rule_id: props.data?.collector_rule_id,
        conditions_policy: state.conditionState ? COLLECTOR_RULE_CONDITION_POLICY.ALWAYS : state.selectedConditionRadioIdx,
        conditions: convertToApiCondition(state.conditionList),
        actions,
        options: {
            stop_processing: state.isStopProcessingChecked,
        },
    });
};
// search fetchers
const fetchCloudServiceGroup = async (keyword = '', idx:number):Promise<SelectDropdownMenuItem[]> => {
    try {
        const { results } = await SpaceConnector.clientV2.inventory.cloudServiceType.stat<CloudServiceTypeStatParameters, ListResponse<string>>(
            {
                query: {
                    distinct: 'group',
                    keyword,
                    filter: [{ k: 'group', v: keyword, o: 'contain' }, { k: 'provider', v: props.provider, o: 'eq' }],
                },
            },
        );
        const menu = results?.map((i) => ({
            label: i,
            name: i,
        })) ?? [];
        state.cloudServiceGroupMenu[idx] = menu;
        return menu;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.cloudServiceGroupMenu = [];
        return [];
    }
};
const fetchCloudServiceType = async (keyword = '', idx:number):Promise<SelectDropdownMenuItem[]> => {
    try {
        const { results } = await SpaceConnector.clientV2.inventory.cloudServiceType.stat(
            {
                query: {
                    keyword,
                    filter: [{ k: 'provider', v: props.provider, o: 'eq' }],
                    distinct: 'name',
                },
            },
        );
        const menu = results?.map((i:string) => ({
            label: i,
            name: i,
        })) ?? [];
        state.cloudServiceTypeMenu[idx] = menu;
        return menu;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.cloudServiceTypeMenu = [];
        return [];
    }
};
const fetchRegion = async (keyword = '', idx:number):Promise<SelectDropdownMenuItem[]> => {
    try {
        const { results } = await SpaceConnector.clientV2.inventory.region.list<RegionListParameters, ListResponse<RegionModel>>(
            {
                query: {
                    keyword,
                    filter: [{ k: 'provider', v: props.provider, o: 'eq' }],
                },
            },
        );
        const menu = results?.map((i) => ({
            label: i.name,
            name: i.region_code,
        })) ?? [];
        state.regionMenu[idx] = menu;
        return menu;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.regionMenu = [];
        return [];
    }
};
const handleSearchValue = debounce(async (keyword:string, key:CollectorRuleConditionKey, idx:number) => {
    state.searchLoading = true;
    state.valueMenuSearchKeyword = keyword;
    if (key === COLLECTOR_RULE_CONDITION_KEY.cloud_service_group) {
        await fetchCloudServiceGroup(keyword, idx);
    } else if (key === COLLECTOR_RULE_CONDITION_KEY.cloud_service_type) {
        await fetchCloudServiceType(keyword, idx);
    }
    state.searchLoading = false;
}, 300);
const DEFAULT_SEARCH_MAP:Record<CollectorRuleConditionKey, SelectDropdownMenuItem[]> = {
    [COLLECTOR_RULE_CONDITION_KEY.cloud_service_group]: [],
    [COLLECTOR_RULE_CONDITION_KEY.cloud_service_type]: [],
    [COLLECTOR_RULE_CONDITION_KEY.region_code]: [],
};

watch(() => state.conditionState, (value) => {
    if (state.isAdminMode) {
        state.selectedActionRadioIdx = value ? 'match_project' : 'change_project';
    }
});

(async () => {
    // init search menu list
    state.initLoading = true;
    DEFAULT_SEARCH_MAP.cloud_service_group = await fetchCloudServiceGroup('', 0);
    DEFAULT_SEARCH_MAP.cloud_service_type = await fetchCloudServiceType('', 0);
    DEFAULT_SEARCH_MAP.region_code = await fetchRegion('', 0);
    state.conditionListKey = 1;
    state.searchLoading = false;
    state.initLoading = false;
})();

onMounted(() => {
    const defaultActionPolicy = props.data?.actions ? Object.keys(props.data?.actions)[0] : undefined;
    if (defaultActionPolicy === 'change_project' && props.data?.actions?.change_project) {
        const selectedProject = state.projects[props.data.actions.change_project];
        state.selectedWorkspaceId = [{
            name: selectedProject.data.workspaceId,
            label: state.workspace[selectedProject.data.workspaceId].label,
        }];
    } else if (defaultActionPolicy === 'match_project' || defaultActionPolicy === 'match_service_account') {
        state.selectedActionRadioIdx = defaultActionPolicy;
        state.sourceInput = props.data?.actions[defaultActionPolicy]?.source ?? '';
        state.targetInput = props.data?.actions[defaultActionPolicy]?.target ?? '';
    }
});
</script>

<template>
    <div class="collector-additional-rule-form">
        <section class="left-section">
            <h5 class="text-paragraph-lg text-gray-900 flex gap-4">
                <span class="condition-title">{{ $t('INVENTORY.COLLECTOR.CONDITIONS') }}</span>
                <div class="flex items-center gap-1">
                    <span :class="{
                        'disabled-condition': !state.conditionState, 'enabled-condition': state.conditionState}"
                    >{{ state.conditionState ? $t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ENABLED_CONDITION'):$t('INVENTORY.COLLECTOR.COLLECTOR_RULE.DISABLED_CONDITION') }}</span>
                    <p-toggle-button :value.sync="state.conditionState" />
                </div>
            </h5>
            <div v-if="!state.conditionState"
                 class="condition-contents-wrapper"
            >
                <p-field-title :label="$t('INVENTORY.COLLECTOR.COLLECTOR_RULE.CONDITION_SATISFIES')"
                               class="mb-2"
                >
                    <template #right>
                        <p-tooltip v-if="state.isConditionTooltipVisible"
                                   class="ml-2"
                                   position="bottom"
                                   :contents="$t('INVENTORY.COLLECTOR.ADDITIONAL_RULE_CONDITION_INFO')"
                        >
                            <p-i width="1rem"
                                 height="1rem"
                                 name="ic_info-circle"
                            />
                        </p-tooltip>
                    </template>
                </p-field-title>
                <div class="condition-policy-wrapper">
                    <p-radio v-for="([key,value], idx) in Object.entries(state.conditionPolicies)"
                             :key="`bookmark-scope-${idx}`"
                             v-model="state.selectedConditionRadioIdx"
                             :value="key"
                    >
                        <span class="radio-item">
                            {{ value }}
                        </span>
                    </p-radio>
                </div>
                <div :key="state.conditionListKey"
                     class="condition-list"
                >
                    <div v-for="(condition, idx) in state.conditionList"
                         :key="`condition-${idx}`"
                         class="condition-item-row"
                    >
                        <p-select-dropdown class="condition-key"
                                           :menu="state.conditionKeyMenu"
                                           :selected="condition.key"
                                           is-fixed-width
                                           @select="handleSelectConditionKey($event, idx)"
                        />
                        <template v-if="condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data)">
                            <p-text-input :value="state.conditionList[idx].subkey"
                                          class="condition-sub-key"
                                          block
                                          is-fixed-width
                                          placeholder="ex) os.os_type"
                                          @update:value="handleUpdateSubkeyInput($event, idx)"
                            />
                        </template>
                        <template v-if="condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)">
                            <p-text-input :value="state.conditionList[idx].subkey"
                                          class="condition-sub-key"
                                          block
                                          is-fixed-width
                                          placeholder="ex) a.b.c"
                                          @update:value="handleUpdateSubkeyInput($event, idx)"
                            />
                        </template>
                        <collector-additional-rule-form-operator-dropdown class="condition-operator"
                                                                          :value="condition.operator"
                                                                          @update:value="handleUpdateOperator($event, idx)"
                        />
                        <template v-if="condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data) || condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)">
                            <span>:</span>
                        </template>
                        <p-select-dropdown v-if="condition.key !== COLLECTOR_RULE_CONDITION_KEY.account
                                               && condition.key !== COLLECTOR_RULE_CONDITION_KEY['reference.resource_id']
                                               && !condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data)
                                               && !condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)"
                                           :menu="valueDropdownMenu(condition.key, idx)"
                                           :search-text="state.valueMenuSearchKeyword"
                                           :selected="condition.value"
                                           :loading="state.searchLoading"
                                           :disabled="state.initLoading"
                                           class="condition-value"
                                           is-fixed-width
                                           is-filterable
                                           use-fixed-menu-style
                                           @update:search-text="handleSearchValue($event, condition.key, idx)"
                                           @select="handleSelectConditionValue($event, idx)"
                        />
                        <p-text-input v-else
                                      v-model="condition.value"
                                      class="condition-value"
                                      block
                                      @update:value="handleUpdateValueInput($event, idx)"
                        />
                        <p-i v-if="state.conditionList.length > 1"
                             class="flex-shrink-0 cursor-pointer"
                             name="ic_delete"
                             @click="handleClickDeleteCondition(idx)"
                        />
                    </div>
                    <p-button style-type="tertiary"
                              icon-left="ic_plus_bold"
                              class="add-event-rule-button"
                              size="md"
                              @click="handleClickAddRule"
                    >
                        {{ $t('COMMON.BUTTONS.ADD') }}
                    </p-button>
                </div>
            </div>
        </section>
        <section class="right-section">
            <h5 class="text-paragraph-lg text-gray-900 font-bold">
                {{ $t('INVENTORY.COLLECTOR.ACTIONS') }}
            </h5>
            <div class="condition-contents-wrapper">
                <div class="condition-policy-wrapper">
                    <p-radio v-for="([key,value], idx) in Object.entries(state.actionPolicies)"
                             :key="`bookmark-scope-${idx}`"
                             v-model="state.selectedActionRadioIdx"
                             :value="key"
                    >
                        <span class="radio-item">
                            {{ value }}
                        </span>
                    </p-radio>
                </div>
                <div class="action-contents-wrapper">
                    <div v-if="state.selectedActionRadioIdx === 'change_project'">
                        <p-field-group v-if="state.isAdminMode"
                                       class="action-field-group"
                                       :label="$t('INVENTORY.COLLECTOR.DETAIL.WORKSPACE')"
                                       required
                        >
                            <workspace-select-dropdown class="action-workspace"
                                                       :selected-workspace-ids="state.selectedWorkspaceId"
                                                       @update:selected-workspace-ids="handleSelectWorkspaceId"
                            />
                        </p-field-group>
                        <p-field-group class="action-field-group"
                                       :label="$t('INVENTORY.COLLECTOR.DETAIL.PROJECT')"
                                       required
                        >
                            <project-select-dropdown :key="state.selectedWorkspaceId[0]?.name"
                                                     class="action-project"
                                                     is-fixed-width
                                                     :disabled="state.isAdminMode ? !state.selectedWorkspaceId[0]?.name : false"
                                                     :selected-project-ids="state.selectedProjectId"
                                                     :project-group-selectable="false"
                                                     :workspace-id="state.selectedWorkspaceId[0]?.name"
                                                     @update:selected-project-ids="handleSelectProjectId"
                            />
                        </p-field-group>
                    </div>
                    <div v-else
                         class="match-box"
                    >
                        <p-field-group class="action-field-group"
                                       :label="$t('INVENTORY.COLLECTOR.COLLECTOR_RULE.CLOUD_SERVICE_SOURCE_KEY')"
                                       required
                        >
                            <p-text-input v-model="state.sourceInput"
                                          class="action-source"
                                          block
                            />
                        </p-field-group>
                        <p-field-group class="action-field-group"
                                       :label="state.selectedActionRadioIdx === 'match_project'
                                           ? $t('INVENTORY.COLLECTOR.COLLECTOR_RULE.PROJECT_TAG_KEY')
                                           : $t('INVENTORY.COLLECTOR.COLLECTOR_RULE.SERVICE_ACCOUNT_TAG_KEY')"
                                       required
                        >
                            <p-text-input v-model="state.targetInput"
                                          class="action-target"
                                          block
                            />
                        </p-field-group>
                    </div>
                </div>
                <div class="stop-processing-wrapper">
                    <p-checkbox v-model="state.isStopProcessingChecked" />{{ $t('INVENTORY.COLLECTOR.THEN_STOP_PROCESSING') }}
                </div>
            </div>
        </section>
        <div class="form-footer">
            <p-button style-type="tertiary"
                      class="cancel-event-rule-button"
                      @click="handleClickCancel"
            >
                {{ $t('COMMON.BUTTONS.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      class="done-event-rule-button"
                      :disabled="!state.isAllValid"
                      @click="handleClickDone"
            >
                {{ $t('COMMON.BUTTONS.DONE') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.collector-additional-rule-form {
    @apply grid grid-cols-12 pt-2;
    gap: 2rem;

    h4 {
        font-size: 1rem;
        line-height: 160%;
    }

    .left-section {
        @apply col-span-6;

        .condition-title {
            font-weight: bold;
        }

        .disabled-condition {
            @apply text-gray-300 text-label-md;
        }

        .enabled-condition {
            @apply text-blue-600 text-label-md;
        }
    }

    .right-section {
        @apply col-span-6;

        .action-contents-wrapper {
            @apply border-4 border-gray-100 rounded-lg mt-3;
            padding: 1rem;
        }

        .match-box {
            @apply flex gap-2;

            /* custom design-system component - p-field-group */
            &:deep(.p-field-group) {
                margin-bottom: 0;
            }

            .action-field-group {
                @apply flex-grow;
            }
        }
    }
    .stop-processing-wrapper {
        @apply flex gap-1 mt-3 justify-end items-center text-label-md text-gray-900;
    }

    .condition-policy-wrapper {
        @apply flex gap-4 mb-4 items-end;
    }

    .form-footer {
        @apply col-span-12 flex justify-end gap-2 mt-3;
        margin-bottom: 0.625rem;
    }
}

.condition-contents-wrapper {
    @apply border-4 border-gray-100 rounded-lg mt-3;
    padding: 1rem;

    .condition-list {
        @apply flex flex-col gap-3;

        .add-event-rule-button {
            width: 6rem;
        }

        .condition-item-row {
            @apply flex gap-2 items-center justify-between;

            .condition-key {
                flex-grow: 1;
            }

            .condition-operator {
                flex-grow: 1;
            }

            .condition-value {
                flex-grow: 1;
            }
        }
    }
}

@screen tablet {
    .collector-additional-rule-form {
        .left-section {
            @apply col-span-12;
        }

        .right-section {
            @apply col-span-12;
            margin-top: 1rem;
        }
    }
}
</style>
