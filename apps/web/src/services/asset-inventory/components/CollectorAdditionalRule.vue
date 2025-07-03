<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PCard, PI, PButton, PPaneLayout, PDivider,
} from '@cloudforet/mirinae';

import type { CollectorRuleChangeOrderParameters } from '@/schema/inventory/collector-rule/api-verbs/change-order';
import type { CollectorRuleCreateParameters } from '@/schema/inventory/collector-rule/api-verbs/create';
import type { CollectorRuleDeleteParameters } from '@/schema/inventory/collector-rule/api-verbs/delete';
import type { CollectorRuleUpdateParameters } from '@/schema/inventory/collector-rule/api-verbs/update';
import type { CollectorRuleModel } from '@/schema/inventory/collector-rule/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorAdditionalRuleContent from '@/services/asset-inventory/components/CollectorAdditionalRuleContent.vue';
import CollectorAdditionalRuleEmptyCase
    from '@/services/asset-inventory/components/CollectorAdditionalRuleEmptyCase.vue';
import CollectorAdditionalRuleForm from '@/services/asset-inventory/components/CollectorAdditionalRuleForm.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { getIsEditableCollector } from '@/services/asset-inventory/helpers/collector-editable-value-helper';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/stores/collector-form-store';
import type { CollectorRuleForm } from '@/services/asset-inventory/types/type';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const appContextStore = useAppContextStore();

interface Props {
    collectorId?: string;
    hasReadWriteAccess?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    collectorId: undefined,
    hasReadWriteAccess: false,
});

const state = reactive({
    orderedCardData: computed<CollectorRuleModel[]>(() => {
        const data = collectorFormState.additionalRules;
        return data.sort((a, b) => a.order - b.order);
    }),
    isEmptyCase: computed<boolean>(() => collectorFormState.additionalRules.length === 0),
    editModeCardOrder: 0,
    isAddCase: computed<boolean>(() => collectorFormState.originCollectorRules?.length === 0
        || collectorFormState.originCollectorRules.length < collectorFormState.additionalRules.length),
    isEditable: computed<boolean>(() => props.hasReadWriteAccess && state.editModeCardOrder === 0 && isEditableCollector.value),
});
const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
const isEditableCollector = computed<boolean>(() => getIsEditableCollector(isAdminMode.value, originCollectorData.value));

/* Utils */
const changeOrder = (targetData, clickedData, tempOrder) => {
    if (targetData.order < clickedData.order) {
        targetData.order = tempOrder;
        clickedData.order = tempOrder - 1;
    } else {
        targetData.order = tempOrder;
        clickedData.order = tempOrder + 1;
    }
};

/* Query */
const { data: originCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => props.collectorId),
});

/* Event Handlers */
const handleClickUpButton = async (data:CollectorRuleModel) => {
    const tempCardData = [...collectorFormState.additionalRules];
    const tempOrder = data.order;
    try {
        changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
        await SpaceConnector.clientV2.inventory.collectorRule.changeOrder<CollectorRuleChangeOrderParameters>({
            collector_rule_id: data.collector_rule_id,
            order: tempOrder - 1,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_REORDER_COLLECTOR_RULES'), '');
    } catch (e) {
        changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_REORDER_COLLECTOR_RULES'));
    } finally {
        collectorFormState.additionalRules = tempCardData;
    }
};
const handleClickDownButton = async (data:CollectorRuleModel) => {
    const tempCardData = [...collectorFormState.additionalRules];
    const tempOrder = data.order;
    try {
        changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
        await SpaceConnector.clientV2.inventory.collectorRule.changeOrder<CollectorRuleChangeOrderParameters>({
            collector_rule_id: data.collector_rule_id,
            order: tempOrder + 1,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_REORDER_COLLECTOR_RULES'), '');
    } catch (e) {
        changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_REORDER_COLLECTOR_RULES'));
    } finally {
        collectorFormState.additionalRules = tempCardData;
    }
};

const handleClickDeleteButton = async (order:number) => {
    try {
        await SpaceConnector.clientV2.inventory.collectorRule.delete<CollectorRuleDeleteParameters>({
            collector_rule_id: state.orderedCardData[order - 1].collector_rule_id,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_DELETE_COLLECTOR_RULE'), '');
        await collectorFormStore.setOriginCollectorRules();
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_DELETE_COLLECTOR_RULE'));
    }
};

const handleClickEditButton = (order: number) => {
    state.editModeCardOrder = order;
};

const handleCancelSetRule = () => {
    if (state.isAddCase) {
        collectorFormState.additionalRules = collectorFormState.originCollectorRules;
    }
    state.editModeCardOrder = 0;
};

const handleClickAddEventRule = async () => {
    collectorFormState.additionalRules = [...collectorFormState.additionalRules, { order: collectorFormState.additionalRules.length + 1 }];
    state.editModeCardOrder = collectorFormState.additionalRules.length;
};
const createCollectorRule = async (data:CollectorRuleForm) => {
    if (!props.collectorId) throw new Error('collector_id is not defined');
    try {
        await SpaceConnector.clientV2.inventory.collectorRule.create<CollectorRuleCreateParameters>({
            collector_id: props.collectorId,
            conditions: data.conditions,
            conditions_policy: data.conditions_policy,
            actions: data.actions,
            options: data.options,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_CREATE_COLLECTOR_RULE'), '');
        await collectorFormStore.setOriginCollectorRules(props.collectorId);
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_CREATE_COLLECTOR_RULE'));
    }
};

const updateCollectorRule = async (data:CollectorRuleForm) => {
    try {
        if (!data.collector_rule_id) {
            throw new Error('collector_rule_id is required');
        }
        await SpaceConnector.clientV2.inventory.collectorRule.update<CollectorRuleUpdateParameters>({
            collector_rule_id: data.collector_rule_id,
            conditions: data.conditions,
            conditions_policy: data.conditions_policy,
            actions: data.actions,
            options: data.options,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_S_UPDATE_COLLECTOR_RULE'), '');
        await collectorFormStore.setOriginCollectorRules(props.collectorId);
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.COLLECTOR_RULE.ALT_E_UPDATE_COLLECTOR_RULE'));
    }
};
const handleSetRule = async (data:CollectorRuleForm) => {
    if (state.isAddCase) {
        await createCollectorRule(data);
    } else {
        await updateCollectorRule(data);
    }
    state.editModeCardOrder = 0;
};

const isEditModeByOrder = (order: number) => state.editModeCardOrder === order;

(async () => {
    await collectorFormStore.setOriginCollectorRules(props.collectorId);
})();
</script>

<template>
    <p-pane-layout class="collector-create-form-rule">
        <p-heading class="pt-8 px-4 pb-4"
                   :title="$t('INVENTORY.COLLECTOR.ADDITIONAL_RULE')"
                   heading-type="sub"
        />
        <div v-if="state.isEmptyCase">
            <collector-additional-rule-empty-case :is-editable="state.isEditable"
                                                  @add-rule="handleClickAddEventRule"
            />
        </div>
        <div v-else>
            <div class="card-list-wrapper">
                <p-card v-for="data in state.orderedCardData"
                        :key="data.order"
                        :style-type="isEditModeByOrder(data.order) ? 'indigo400' :'gray100'"
                >
                    <template #header>
                        <div class="card-header">
                            <div class="left-part">
                                <div v-if="!isEditModeByOrder(data.order)">
                                    <span class="order-text">#<strong>{{ data.order }}</strong></span>
                                    <span v-if="state.isEditable"
                                          class="arrow-button"
                                          :class="{'disabled': data.order === 1}"
                                          @click="handleClickUpButton(data)"
                                    >
                                        <p-i name="ic_arrow-up"
                                             width="1.5rem"
                                             height="1.5rem"
                                             color="inherit transparent"
                                        />
                                    </span>
                                    <span v-if="state.isEditable"
                                          class="arrow-button"
                                          :class="{'disabled': (data.order === collectorFormState.originCollectorRules?.length)}"
                                          @click="handleClickDownButton(data)"
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
                            <div v-if="!isEditModeByOrder(data.order) && state.isEditable"
                                 class="right-part"
                            >
                                <span class="text-button delete"
                                      @click="handleClickDeleteButton(data.order)"
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
                                                            @click-done="handleSetRule"
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
                          :disabled="!state.isEditable"
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
