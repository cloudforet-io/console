<template>
    <general-page-layout class="add-service-account-container">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title child :title="$t('PROJECT.EVENT_RULE.EVENT_RULE')"
                      class="page-title"
                      @goBack="$router.go(-1)"
        />
        <div v-if="!isEditMode && !cardData.length" class="no-data-wrapper">
            <p class="title">
                {{ $t('PROJECT.EVENT_RULE.NO_EVENT_RULES_TITLE') }}
            </p>
            <p class="help-text">
                {{ $t('PROJECT.EVENT_RULE.NO_EVENT_RULES_HELP_TEXT') }}
            </p>
            <p-icon-text-button style-type="primary-dark" name="ic_plus_bold"
                                @click="onClickAddEventRule"
            >
                {{ $t('PROJECT.EVENT_RULE.ADD_EVENT_RULE') }}
            </p-icon-text-button>
        </div>
        <div v-for="data in orderedCardData" :key="data.order" class="card-list-wrapper">
            <p-card class="card" :style-type="isEditMode ? 'indigo400' : 'gray100'">
                <template #header>
                    <div class="left-part">
                        <span class="order-text">#<strong>{{ data.order }}</strong></span>
                        <span :class="{'disabled': data.order === 1 || isEditMode}"
                              class="arrow-button"
                              @click="onClickUpButton(data)"
                        >
                            <p-i name="ic_up" width="1rem" height="1rem"
                                 color="inherit transparent"
                            />
                        </span>
                        <span :class="{'disabled': data.order === orderedCardData.length || isEditMode}"
                              class="arrow-button"
                              @click="onClickDownButton(data)"
                        >
                            <p-i name="ic_down" width="1rem" height="1rem"
                                 color="inherit transparent"
                            />
                        </span>
                    </div>
                    {{ data }}
                    <div class="right-part">
                        <span class="text-button delete"
                              :class="{'disabled': isEditMode}"
                              @click="onClickDeleteButton(data.order)"
                        >
                            {{ $t('PROJECT.EVENT_RULE.DELETE') }}
                        </span>
                        |
                        <span class="text-button edit"
                              :class="{'disabled': isEditMode}"
                              @click="onClickEditButton()"
                        >
                            <p-i name="ic_edit" width="0.75rem" height="0.75rem"
                                 color="inherit"
                            />
                            {{ $t('PROJECT.EVENT_RULE.EDIT') }}
                        </span>
                    </div>
                </template>
                {{ data.event_rule_id }}
            </p-card>
            <p-icon-text-button style-type="primary-dark" name="ic_plus_bold"
                                outline
                                class="add-event-rule-button"
                                @click="onClickAddEventRule"
            >
                {{ $t('PROJECT.EVENT_RULE.ADD_EVENT_RULE') }}
            </p-icon-text-button>
        </div>
        <p-card class="card" style-type="indigo400"
                :header="$t('PROJECT.EVENT_RULE.ADD_EVENT_RULE')"
        >
<!--            v-if="isEditMode && mode === EDIT_MODE.CREATE"-->
            <event-rule-condition-form class="event-rule-condition-form" />
            <event-rule-action-form class="event-rule-action-form" />
        </p-card>
    </general-page-layout>
</template>


<script lang="ts">
/* eslint-disable camelcase */
import { i18n } from '@/translations';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PPageTitle, PBreadcrumbs, PCard, PI, PIconTextButton,
} from '@spaceone/design-system';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import EventRuleActionForm from '@/views/project/project/modules/event-rule/EventRuleActionForm.vue';
import EventRuleConditionForm from '@/views/project/project/modules/event-rule/EventRuleConditionForm.vue';

import { SpaceConnector } from '@/lib/space-connector';


const EDIT_MODE = Object.freeze({
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
});
type EDIT_MODE = typeof EDIT_MODE[keyof typeof EDIT_MODE];

export default {
    name: 'AddEventRulePage',
    components: {
        EventRuleConditionForm,
        EventRuleActionForm,
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
        PCard,
        PI,
        PIconTextButton,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            project: {},
            cardData: [],
            orderedCardData: computed(() => state.cardData.sort((a, b) => a.order - b.order)),
            isEditMode: false,
            mode: undefined as undefined | EDIT_MODE,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: i18n.t('MENU.PROJECT.PROJECT'), path: '/project' },
                { name: state.project?.project_group_info?.name, path: `/project?select_pg=${state.project?.project_group_info?.project_group_id}` },
                { name: state.project?.name, path: `/project/${props.projectId}` },
                { name: i18n.t('PROJECT.EVENT_RULE.EVENT_RULE') },
            ])),
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
        const getProject = async () => {
            try {
                state.project = await SpaceConnector.client.identity.project.get({
                    project_id: props.projectId,
                });
            } catch (e) {
                state.project = {};
                console.error(e);
            }
        };
        const listEventRule = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.eventRule.list();
                state.cardData = res.results;
            } catch (e) {
                state.cardData = [];
                console.error(e);
            }
        };
        const onClickAddEventRule = async () => {
            state.isEditMode = true;
            state.mode = EDIT_MODE.CREATE;
        };

        /* event */
        const onClickUpButton = async (data) => {
            const tempCardData = [...state.cardData];
            const tempOrder = data.order;
            try {
                changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
                await SpaceConnector.client.monitoring.eventRule.changeOrder({
                    event_rule_id: data.event_rule_id,
                    order: tempOrder - 1,
                });
            } catch (e) {
                changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
            } finally {
                state.cardData = tempCardData;
            }
        };
        const onClickDownButton = async (data) => {
            const tempCardData = [...state.cardData];
            const tempOrder = data.order;
            try {
                changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
                await SpaceConnector.client.monitoring.eventRule.changeOrder({
                    event_rule_id: data.event_rule_id,
                    order: tempOrder + 1,
                });
                state.cardData = tempCardData;
            } catch (e) {
                changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
            } finally {
                state.cardData = tempCardData;
            }
        };
        const onClickDeleteButton = () => {
            console.log('delete!');
        };
        const onClickEditButton = () => {
            state.isEditMode = true;
            console.log('edit!');
        };

        (async () => {
            await Promise.all([
                getProject(),
                listEventRule(),
            ]);
        })();

        return {
            ...toRefs(state),
            routeState,
            EDIT_MODE,
            onClickUpButton,
            onClickDownButton,
            onClickDeleteButton,
            onClickEditButton,
            onClickAddEventRule,
        };
    },
};
</script>

<style lang="postcss" scoped>
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

    .add-event-rule-button {
        width: 100%;
        margin-top: 1rem;
    }
}
.card::v-deep {
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
            .text-button {
                cursor: pointer;
                margin: 0 0.75rem;
                &:hover {
                    &.delete {
                        @apply text-alert;
                    }
                    &.edit {
                        @apply text-secondary;
                    }
                }
                &:disabled {
                    @apply text-gray-300;
                    cursor: not-allowed;
                }
            }
        }
    }

    .body {
        @apply grid grid-cols-12;
        gap: 2rem;
        padding: 2rem;

        .event-rule-condition-form {
            @apply col-span-6;
        }
        .event-rule-action-form {
            @apply col-span-6;
        }
    }
}

@screen tablet {
    .card::v-deep {
        .body {
            display: block;

            .event-rule-action-form {
                padding-top: 2rem;
            }
        }
    }
}
</style>
