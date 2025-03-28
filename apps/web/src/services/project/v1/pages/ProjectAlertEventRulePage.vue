<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PCard, PI, PButton,
} from '@cloudforet/mirinae';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EventRuleChangeOrderParameters } from '@/schema/monitoring/event-rule/api-verbs/change-order';
import type { EventRuleDeleteParameters } from '@/schema/monitoring/event-rule/api-verbs/delete';
import type { EventRuleListParameters } from '@/schema/monitoring/event-rule/api-verbs/list';
import type { EventRuleModel } from '@/schema/monitoring/event-rule/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import InfoMessage from '@/common/components/guidance/InfoMessage.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectAlertEventRuleContent from '@/services/project/v1/components/ProjectAlertEventRuleContent.vue';
import ProjectAlertEventRuleForm from '@/services/project/v1/components/ProjectAlertEventRuleForm.vue';

type EditMode = 'CREATE' | 'UPDATE';

interface Props {
    projectId: string;
}
const props = defineProps<Props>();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
});
const state = reactive({
    loading: true,
    project: computed<ProjectReferenceItem>(() => storeState.projects[props.projectId]),
    cardData: [] as EventRuleModel[],
    orderedCardData: computed<EventRuleModel[]>(() => {
        const data = state.cardData;
        return data.sort((a, b) => a.order - b.order);
    }),
    isEditMode: false,
    mode: undefined as undefined | EditMode,
    selectedOrder: undefined as number|undefined,
});
const checkDeleteState = reactive({
    visible: false,
    headerTitle: computed(() => i18n.t('PROJECT.EVENT_RULE.DELETE_MODAL_TITLE')),
});

const changeOrder = (targetData, clickedData, tempOrder) => {
    if (targetData.order < clickedData.order) {
        targetData.order = tempOrder;
        clickedData.order = tempOrder - 1;
    } else {
        targetData.order = tempOrder;
        clickedData.order = tempOrder + 1;
    }
};

/* api */
const listEventRule = async () => {
    try {
        state.loading = true;
        const res = await SpaceConnector.clientV2.monitoring.eventRule.list<EventRuleListParameters, ListResponse<EventRuleModel>>({
            project_id: props.projectId,
        });
        state.cardData = res.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.cardData = [];
    } finally {
        state.loading = false;
    }
};

/* event */
const onClickAddEventRule = async () => {
    state.isEditMode = true;
    state.mode = 'CREATE';
    state.selectedOrder = undefined;
};
const handleClickUpButton = async (data) => {
    const tempCardData = [...state.cardData];
    const tempOrder = data.order;
    try {
        changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
        await SpaceConnector.clientV2.monitoring.eventRule.changeOrder<EventRuleChangeOrderParameters>({
            event_rule_id: data.event_rule_id,
            order: tempOrder - 1,
        });
        showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_S_REORDER_EVENT_RULES'), '');
    } catch (e) {
        changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
        showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_E_REORDER_EVENT_RULES'), '');
    } finally {
        state.cardData = tempCardData;
    }
};
const onClickDownButton = async (data) => {
    const tempCardData = [...state.cardData];
    const tempOrder = data.order;
    try {
        changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
        await SpaceConnector.clientV2.monitoring.eventRule.changeOrder<EventRuleChangeOrderParameters>({
            event_rule_id: data.event_rule_id,
            order: tempOrder + 1,
        });
        state.cardData = tempCardData;
        showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_S_REORDER_EVENT_RULES'), '');
    } catch (e) {
        changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
        showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_E_REORDER_EVENT_RULES'), '');
    } finally {
        state.cardData = tempCardData;
    }
};
const eventRuleDeleteConfirm = async () => {
    try {
        if (state.selectedOrder === undefined) throw new Error('Selected order is required');
        await SpaceConnector.clientV2.monitoring.eventRule.delete<EventRuleDeleteParameters>({
            event_rule_id: state.orderedCardData[state.selectedOrder - 1].event_rule_id,
        });
        showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_S_DELETE_EVENT_RULE'), '');
        await listEventRule();
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.EVENT_RULE.ALT_E_DELETE_EVENT_RULE'));
    } finally {
        checkDeleteState.visible = false;
        state.selectedOrder = undefined;
    }
};
const handleClickDeleteButton = (order: number) => {
    checkDeleteState.visible = true;
    state.selectedOrder = order;
};
const handleClickEditButton = (order: number) => {
    state.isEditMode = true;
    state.mode = 'UPDATE';
    state.selectedOrder = order;
};
const handleClickFormConfirm = async () => {
    state.isEditMode = false;
    state.selectedOrder = undefined;
    await listEventRule();
};
const handleClickFormCancel = () => {
    state.isEditMode = false;
    state.selectedOrder = undefined;
};

(async () => {
    await listEventRule();
})();
</script>

<template>
    <div class="project-alert-event-rule-page">
        <p-heading class="mb-6"
                   show-back-button
                   :title="$t('PROJECT.EVENT_RULE.EVENT_RULE')"
                   @click-back-button="$router.go(-1)"
        >
            <template #title-right-extra>
                <info-message :message="$t('PROJECT.EVENT_RULE.TITLE_INFO_MESSAGE')" />
            </template>
        </p-heading>
        <div v-if="!state.loading && !state.isEditMode && !state.cardData.length"
             class="no-data-wrapper"
        >
            <p class="title">
                {{ $t('PROJECT.EVENT_RULE.NO_EVENT_RULES_TITLE') }}
            </p>
            <p class="help-text">
                {{ $t('PROJECT.EVENT_RULE.NO_EVENT_RULES_HELP_TEXT') }}
            </p>
            <p-button style-type="primary"
                      icon-left="ic_plus_bold"
                      @click="onClickAddEventRule"
            >
                {{ $t('PROJECT.EVENT_RULE.ADD_EVENT_RULE') }}
            </p-button>
        </div>
        <div v-for="data in state.orderedCardData"
             :key="data.order"
             class="card-list-wrapper"
        >
            <p-card :style-type="state.isEditMode && state.selectedOrder === data.order ? 'indigo400' : 'gray100'"
                    :header="(state.isEditMode && (state.selectedOrder === data.order)) ? $t('PROJECT.EVENT_RULE.EDIT_EVENT_RULE') : ''"
            >
                <template #header>
                    <template v-if="!(state.isEditMode && state.selectedOrder === data.order)">
                        <div class="left-part">
                            <span class="order-text">#<strong>{{ data.order }}</strong></span>
                            <span :class="{'disabled': data.order === 1 || state.isEditMode}"
                                  class="arrow-button"
                                  @click="handleClickUpButton(data)"
                            >
                                <p-i name="ic_arrow-up"
                                     width="1.5rem"
                                     height="1.5rem"
                                     color="inherit transparent"
                                />
                            </span>
                            <span :class="{'disabled': (data.order === state.orderedCardData.length) || state.isEditMode}"
                                  class="arrow-button"
                                  @click="onClickDownButton(data)"
                            >
                                <p-i name="ic_arrow-down"
                                     width="1.5rem"
                                     height="1.5rem"
                                     color="inherit transparent"
                                />
                            </span>
                        </div>
                        <div class="right-part">
                            <span class="text-button delete"
                                  :class="{'disabled': state.isEditMode}"
                                  @click="handleClickDeleteButton(data.order)"
                            >
                                {{ $t('PROJECT.EVENT_RULE.DELETE') }}
                            </span>
                            <span class="text-gray-300">|</span>
                            <span class="text-button edit"
                                  :class="{'disabled': state.isEditMode}"
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
                    </template>
                </template>
                <project-alert-event-rule-form
                    v-if="state.isEditMode && (state.selectedOrder === data.order)"
                    :project-id="props.projectId"
                    :event-rule-id="data.event_rule_id"
                    mode="UPDATE"
                    @confirm="handleClickFormConfirm"
                    @cancel="handleClickFormCancel"
                />
                <project-alert-event-rule-content
                    v-else
                    :data="data"
                />
            </p-card>
        </div>
        <p-card v-if="state.isEditMode && (state.mode === 'CREATE')"
                style-type="indigo400"
                :header="$t('PROJECT.EVENT_RULE.ADD_EVENT_RULE')"
        >
            <project-alert-event-rule-form
                :project-id="props.projectId"
                mode="CREATE"
                @confirm="handleClickFormConfirm"
                @cancel="handleClickFormCancel"
            />
        </p-card>
        <p-button v-if="state.cardData.length"
                  :disabled="state.isEditMode"
                  style-type="secondary"
                  icon-left="ic_plus_bold"
                  class="add-event-rule-button"
                  @click="onClickAddEventRule"
        >
            {{ $t('PROJECT.EVENT_RULE.ADD_EVENT_RULE') }}
        </p-button>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :contents="$t('PROJECT.EVENT_RULE.DELETE_MODAL_DESC')"
                      @confirm="eventRuleDeleteConfirm"
        />
    </div>
</template>

<style lang="postcss" scoped>
.project-alert-event-rule-page {
    .no-data-wrapper {
        @apply border border-gray-200 rounded-md;
        width: 100%;
        box-sizing: border-box;
        text-align: center;
        padding: 3rem;
        .title {
            @apply text-gray-800;
            font-size: 1.125rem;
            line-height: 1.55;
            margin-bottom: 1rem;
        }
        .help-text {
            @apply text-gray-500;
            font-size: 0.875rem;
            line-height: 1.5;
            white-space: pre-line;
            margin-bottom: 1.5rem;
        }
    }
    .card-list-wrapper {
        display: flex;
        flex-direction: column;
    }
    .add-event-rule-button {
        width: 100%;
        margin-top: 1rem;
    }

    /* custom design-system component - p-card */
    :deep(.p-card) {
        margin-bottom: 1rem;

        header {
            display: flex;
            justify-content: space-between;
            font-size: 1rem;
            font-weight: normal;

            .left-part {
                display: flex;
                align-items: center;
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
                    @apply text-gray-800;
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
                    &.disabled {
                        @apply text-gray-300;
                        pointer-events: none;
                    }
                }
            }
        }

        .body {
            padding: 1.5rem 1rem;
        }
    }
}

@screen tablet {
    /* custom design-system component - p-card */
    :deep(.p-card) {
        .body {
            display: block;
        }
    }
}
</style>
