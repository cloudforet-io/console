<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PHeading, PCard, PI, PButton, PPaneLayout, PDivider,
} from '@cloudforet/mirinae';

import { useCollectorRuleApi } from '@/api-clients/inventory/collector-rule/composables/use-collector-rule-api';
import type { CollectorRuleChangeOrderParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/change-order';
import type { CollectorRuleCreateParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/create';
import type { CollectorRuleDeleteParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/delete';
import type { CollectorRuleUpdateParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/update';
import type { AdditionalRuleAction, AdditionalRuleCondition, CollectorRuleModel } from '@/api-clients/inventory/collector-rule/schema/model';
import type { CollectorRuleConditionPolicy } from '@/api-clients/inventory/collector-rule/schema/type';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorAdditionalRuleContent from '@/services/asset-inventory/components/CollectorAdditionalRuleContent.vue';
import CollectorAdditionalRuleEmptyCase from '@/services/asset-inventory/components/CollectorAdditionalRuleEmptyCase.vue';
import CollectorAdditionalRuleForm from '@/services/asset-inventory/components/CollectorAdditionalRuleForm.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { useCollectorRuleListQuery } from '@/services/asset-inventory/composables/use-collector-rule-list-query';
import { getIsEditableCollector } from '@/services/asset-inventory/helpers/collector-editable-value-helper';


const appContextStore = useAppContextStore();
const { collectorRuleAPI } = useCollectorRuleApi();

interface CollectorRuleForm {
    collector_rule_id?: string;
    conditions_policy: CollectorRuleConditionPolicy;
    conditions: AdditionalRuleCondition[];
    actions: AdditionalRuleAction;
    options?: {
        stop_processing: boolean;
    };
    order: number;
}
interface Props {
    collectorId?: string;
    hasReadWriteAccess?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    collectorId: undefined,
    hasReadWriteAccess: false,
});

const state = reactive({
    collectorRuleForm: undefined as CollectorRuleForm | undefined,
    editModeCardOrder: undefined as number | undefined,
});
const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
const noCollectorRules = computed<boolean>(() => originCollectorRules.value?.length === 0);
const isEditableCollector = computed<boolean>(() => getIsEditableCollector(isAdminMode.value, originCollectorData.value));
const isEditable = computed<boolean>(() => props.hasReadWriteAccess && isEditableCollector.value);
const isEditing = computed<boolean>(() => state.editModeCardOrder !== undefined);
const mergedCollectorRules = computed<Array<CollectorRuleModel | CollectorRuleForm>>(() => { // originCollectorRules + collectorRuleForm
    let rules = originCollectorRules.value ?? [];
    if (state.collectorRuleForm) {
        rules = [...rules, state.collectorRuleForm as CollectorRuleModel];
    }
    return rules.sort((a, b) => a.order - b.order);
});

/* Utils */
const isEditModeByOrder = (order: number) => state.editModeCardOrder === order;

/* Query */
const queryClient = useQueryClient();
const { data: originCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => props.collectorId),
});
const { data: originCollectorRules, collectorRuleListQueryKey } = useCollectorRuleListQuery({
    collectorId: computed(() => props.collectorId),
});

/* Mutations */
const { mutate: updateCollectorRule } = useMutation({
    mutationFn: (params: CollectorRuleUpdateParameters) => {
        if (!params.collector_rule_id) {
            throw new Error('collector_rule_id is required');
        }
        return collectorRuleAPI.update(params);
    },
    onSuccess: async () => {
        state.editModeCardOrder = undefined;
        state.collectorRuleForm = undefined;
        queryClient.invalidateQueries({ queryKey: collectorRuleListQueryKey.value });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_UPDATE_COLLECTOR_RULE'), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_UPDATE_COLLECTOR_RULE'));
    },
});
const { mutate: createCollectorRule } = useMutation({
    mutationFn: (params: CollectorRuleCreateParameters) => {
        if (!params.collector_id) {
            throw new Error('collector_id is required');
        }
        return collectorRuleAPI.create(params);
    },
    onSuccess: async () => {
        state.editModeCardOrder = undefined;
        state.collectorRuleForm = undefined;
        queryClient.invalidateQueries({ queryKey: collectorRuleListQueryKey.value });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_CREATE_COLLECTOR_RULE'), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_CREATE_COLLECTOR_RULE'));
    },
});
const { mutate: changeCollectorRuleOrder } = useMutation({
    mutationFn: (params: CollectorRuleChangeOrderParameters) => {
        if (!params.collector_rule_id) {
            throw new Error('collector_rule_id is required');
        }
        return collectorRuleAPI.changeOrder(params);
    },
    onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: collectorRuleListQueryKey.value });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_REORDER_COLLECTOR_RULES'), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_REORDER_COLLECTOR_RULES'));
    },
});
const { mutate: deleteCollectorRule } = useMutation({
    mutationFn: (params: CollectorRuleDeleteParameters) => {
        if (!params.collector_rule_id) {
            throw new Error('collector_rule_id is required');
        }
        return collectorRuleAPI.delete(params);
    },
    onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: collectorRuleListQueryKey.value });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_DELETE_COLLECTOR_RULE'), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_DELETE_COLLECTOR_RULE'));
    },
});

/* Event Handlers */
const handleChangeOrder = async (order: number, direction: 'up' | 'down') => {
    const targetData = originCollectorRules.value?.[order - 1];
    changeCollectorRuleOrder({
        collector_rule_id: targetData?.collector_rule_id || '',
        order: direction === 'up' ? (order - 1) : (order + 1),
    });
};

const handleClickDeleteButton = async (collectorRuleId: string) => {
    deleteCollectorRule({
        collector_rule_id: collectorRuleId,
    });
};

const handleClickEditButton = (order: number) => {
    state.editModeCardOrder = order;
};

const handleCancelSetRule = () => {
    state.collectorRuleForm = undefined;
    state.editModeCardOrder = undefined;
};
const handleClickAddEventRule = async () => {
    const newOrder = (originCollectorRules.value?.length ?? 0) + 1;
    state.collectorRuleForm = {
        conditions_policy: 'ALL',
        conditions: [],
        actions: {},
        options: { stop_processing: false },
        order: newOrder,
    };
    state.editModeCardOrder = newOrder;
};
const handleSaveRule = (data: CollectorRuleModel | CollectorRuleForm) => {
    if (data.collector_rule_id) {
        updateCollectorRule({
            collector_rule_id: data.collector_rule_id,
            conditions: data.conditions,
            conditions_policy: data.conditions_policy,
            actions: data.actions,
            options: data.options,
        });
    } else {
        createCollectorRule({
            collector_id: props.collectorId || '',
            conditions: data.conditions,
            conditions_policy: data.conditions_policy,
            actions: data.actions,
            options: data.options,
        });
    }
};
</script>

<template>
    <p-pane-layout class="collector-create-form-rule">
        <p-heading class="pt-8 px-4 pb-4"
                   :title="$t('INVENTORY.COLLECTOR.ADDITIONAL_RULE')"
                   heading-type="sub"
        />
        <div v-if="noCollectorRules">
            <collector-additional-rule-empty-case :is-editable="isEditable && !isEditing"
                                                  @add-rule="handleClickAddEventRule"
            />
        </div>
        <div v-else>
            <div class="card-list-wrapper">
                <p-card v-for="data in mergedCollectorRules"
                        :key="data.order"
                        :style-type="isEditModeByOrder(data.order) ? 'indigo400' :'gray100'"
                >
                    <template #header>
                        <div class="card-header">
                            <div class="left-part">
                                <div v-if="!isEditModeByOrder(data.order)">
                                    <span class="order-text">#<strong>{{ data.order }}</strong></span>
                                    <span v-if="isEditable && !isEditing"
                                          class="arrow-button"
                                          :class="{'disabled': data.order === 1}"
                                          @click="handleChangeOrder(data.order, 'up')"
                                    >
                                        <p-i name="ic_arrow-up"
                                             width="1.5rem"
                                             height="1.5rem"
                                             color="inherit transparent"
                                        />
                                    </span>
                                    <span v-if="isEditable && !isEditing"
                                          class="arrow-button"
                                          :class="{'disabled': (data.order === (originCollectorRules?.length ?? 0))}"
                                          @click="handleChangeOrder(data.order, 'down')"
                                    >
                                        <p-i name="ic_arrow-down"
                                             width="1.5rem"
                                             height="1.5rem"
                                             color="inherit transparent"
                                        />
                                    </span>
                                </div>
                                <div v-else>
                                    {{ $t('INVENTORY.COLLECTOR.EDIT_ADDITIONAL_RULE') }}
                                </div>
                            </div>
                            <div v-if="isEditable && !isEditing && data.collector_rule_id"
                                 class="right-part"
                            >
                                <span class="text-button delete"
                                      @click="handleClickDeleteButton(data.collector_rule_id)"
                                >
                                    {{ $t('PROJECT.EVENT_RULE.DELETE') }}
                                </span>
                                <p-divider vertical
                                           style="height: 1rem;"
                                />
                                <span class="text-button edit"
                                      @click="handleClickEditButton(data.order)"
                                >
                                    <p-i name="ic_edit"
                                         width="1rem"
                                         height="1rem"
                                         color="inherit"
                                    />
                                    {{ $t('PROJECT.EVENT_RULE.EDIT') }}
                                </span>
                            </div>
                        </div>
                    </template>
                    <div class="additional-rule-form">
                        <div v-if="isEditModeByOrder(data.order)"
                             class="edit-card"
                        >
                            <collector-additional-rule-form :data="data"
                                                            :provider="originCollectorData?.provider"
                                                            @click-done="handleSaveRule"
                                                            @click-cancel="handleCancelSetRule"
                            />
                        </div>
                        <div v-else
                             class="view-card"
                        >
                            <collector-additional-rule-content :data="data" />
                        </div>
                    </div>
                </p-card>
            </div>
            <div class="layout-footer">
                <p-button style-type="tertiary"
                          icon-left="ic_plus_bold"
                          class="add-event-rule-button"
                          :disabled="!isEditable || isEditing"
                          @click="handleClickAddEventRule"
                >
                    {{ $t('INVENTORY.COLLECTOR.ADD_ADDITIONAL_RULE') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>

.collector-create-form-rule {
    .card-list-wrapper {
        @apply flex flex-col gap-4;
        margin: 1.5rem 1rem 0 1rem;

        .card-header {
            display: flex;
            justify-content: space-between;
            font-size: 1rem;
            font-weight: normal;

            .left-part {
                @apply flex items-center gap-1;

                .order-text {
                    @apply text-blue-900;
                    font-size: 1rem;
                    padding-right: 0.5rem;
                }

                .arrow-button {
                    @apply cursor-pointer text-gray-800;
                    &.disabled {
                        @apply pointer-events-none cursor-not-allowed text-gray-200;
                    }
                    &:hover {
                        @apply text-secondary;
                    }
                }
            }

            .right-part {
                display: flex;
                align-items: center;
                font-size: 0.875rem;
                .text-button {
                    @apply text-gray-700;
                    cursor: pointer;
                    margin: 0 0.75rem;
                    &:hover {
                        &.delete {
                            @apply text-alert underline;
                        }
                        &.edit {
                            @apply text-secondary underline;
                        }
                    }
                }
            }
        }

        .additional-rule-form {
            padding: 0.625rem;
        }
    }

    .layout-footer {
        margin: 0 1rem 1.5rem 1rem;
        .add-event-rule-button {
            margin: 1rem 0;
            width: 100%;
        }
    }
}
</style>
