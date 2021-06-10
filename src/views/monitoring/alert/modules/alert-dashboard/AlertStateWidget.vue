<template>
    <div class="alert-state-widget">
        <p class="title">
            {{ $t('MONITORING.ALERT.DASHBOARD.ALERT_STATE') }}
        </p>
        <div class="content-wrapper">
            <!--tabs-->
            <p-balloon-tab v-model="activeTab"
                           class="tablet:hidden"
                           :tabs="tabs"
                           size="lg"
                           position="left"
                           :style-type="tabItems[activeTab].styleType"
                           tail
            >
                <template #tab="{label, name}">
                    <div class="tab-button">
                        {{ label }} <span class="count">{{ tabItems[name].count }}</span>
                    </div>
                </template>
            </p-balloon-tab>
            <p-balloon-tab v-model="activeTab"
                           class="hidden tablet:block"
                           :tabs="tabs"
                           size="sm"
                           :style-type="tabItems[activeTab].styleType"
            >
                <template #tab="{label, name}">
                    <span>{{ label }} <strong>{{ tabItems[name].count }}</strong></span>
                </template>
            </p-balloon-tab>
            <!--tab content-->
            <div class="tab-content-wrapper">
                <!--filter-->
                <div class="filter-wrapper">
                    <div class="left-part">
                        <p-select-status v-for="(status, idx) in statusList" :key="idx"
                                         v-model="selectedStatus"
                                         :value="status.name"
                                         :icon="status.icon"
                                         :disable-check-icon="true"
                        >
                            {{ status.label }}
                        </p-select-status>
                    </div>
                    <div class="right-part">
                        <p-select-button v-for="(state, idx) in assignedStateList" :key="`assigned-${idx}`"
                                         v-model="selectedAssignedState"
                                         :value="state.name"
                                         size="sm"
                                         style-type="gray"
                        >
                            {{ state.label }}
                        </p-select-button>
                        <p-text-pagination :this-page="thisPage"
                                           :all-page="allPage"
                                           @pageChange="changePageNumber"
                        />
                    </div>
                </div>
                <!--list-->
                <p-list-card :items="listItems">
                    <template #header>
                        <div class="mobile-header">
                            <p-check-box v-model="isAssignedToMe">
                                <span>{{ $t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME') }}</span>
                            </p-check-box>
                            <p-text-pagination
                                :this-page.sync="thisPage"
                                :all-page="allPage"
                                @pageChange="changePageNumber"
                            />
                        </div>
                    </template>
                    <template #item="{item, index}">
                        <div class="card-wrapper">
                            <div class="left-part">
                                <p-i :name="item.icon" width="1em" height="1em" />
                                <span class="value">{{ item.value }}</span>
                                <span class="project">{{ item.project }}</span>
                            </div>
                            <div class="right-part">
                                <p-badge :style-type="item.badge === 'acknowledged' ? 'red100' : 'blue200'">
                                    {{ item.badge }}
                                </p-badge>
                                <span class="date">{{ item.date }}</span>
                            </div>
                        </div>
                    </template>
                </p-list-card>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    PBalloonTab, PListCard, PI, PBadge, PSelectStatus, PTextPagination, PSelectButton, PCheckBox,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';


const ALERT_STATE = Object.freeze({
    OPEN: 'OPEN',
    RESOLVED: 'RESOLVED',
    ALL: 'ALL',
});

const ALERT_URGENCY = Object.freeze({
    ALL: 'ALL',
    HIGH: 'HIGH',
    LOW: 'LOW',
});

const ASSIGNED_STATE = Object.freeze({
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
});

export default {
    name: 'AlertStateWidget',
    components: {
        PBalloonTab,
        PListCard,
        PI,
        PBadge,
        PSelectStatus,
        PTextPagination,
        PSelectButton,
        PCheckBox,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            tabs: computed(() => ([
                {
                    name: ALERT_STATE.OPEN,
                    label: vm.$t('MONITORING.ALERT.DASHBOARD.OPEN'),
                },
                {
                    name: ALERT_STATE.RESOLVED,
                    label: vm.$t('MONITORING.ALERT.DASHBOARD.RESOLVED'),
                },
                {
                    name: ALERT_STATE.ALL,
                    label: vm.$t('MONITORING.ALERT.DASHBOARD.ALL_STATE'),
                },
            ])),
            statusList: computed(() => ([
                {
                    name: ALERT_URGENCY.ALL,
                    label: vm.$t('MONITORING.ALERT.DASHBOARD.ALL_URGENCY'),
                },
                {
                    name: ALERT_URGENCY.HIGH,
                    label: vm.$t('MONITORING.ALERT.DASHBOARD.HIGH'),
                    icon: 'ic_alert',
                },
                {
                    name: ALERT_URGENCY.LOW,
                    label: vm.$t('MONITORING.ALERT.DASHBOARD.LOW'),
                    icon: 'ic_state_duplicated',
                },
            ])),
            assignedStateList: computed(() => [
                {
                    name: ASSIGNED_STATE.ALL,
                    label: vm.$t('MONITORING.ALERT.DASHBOARD.ALL'),
                },
                {
                    name: ASSIGNED_STATE.ASSIGNED_TO_ME,
                    label: vm.$t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME'),
                },
            ]),
            //
            activeTab: ALERT_STATE.OPEN,
            selectedStatus: ALERT_URGENCY.ALL,
            selectedAssignedState: ASSIGNED_STATE.ALL,
            isAssignedToMe: false,
            tabItems: {
                OPEN: {
                    count: 122,
                    styleType: 'alert',
                },
                RESOLVED: {
                    count: 23,
                    styleType: 'gray',
                },
                ALL: {
                    count: 145,
                    styleType: 'primary',
                },
            },
            listItems: [
                {
                    value: 'Netsparker Enterprise Test Issue',
                    icon: 'ic_alert',
                    project: 'Group > Project',
                    badge: 'acknowledged',
                    date: '05/17 17:04',
                },
                {
                    value: 'Vulnerability - Local File Inclusion',
                    icon: 'ic_state_duplicated',
                    project: 'Group > Project',
                    badge: 'triggered',
                    date: '05/17 17:06',
                },
            ],
            thisPage: 1,
            allPage: 1,
        });

        /* util */
        const changePageNumber = (page) => {
            state.thisPage = page;
        };

        return {
            ...toRefs(state),
            changePageNumber,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-state-widget {
    @apply bg-white border border-gray-200 rounded-md;
    padding: 1rem;

    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.6;
        font-weight: bold;
        margin-bottom: 1.25rem;
    }

    .content-wrapper {
        @apply grid grid-cols-12 gap-2;
        vertical-align: middle;

        @screen tablet {
            display: block;
        }

        .p-balloon-tab::v-deep {
            @apply col-span-3;
            .balloon-group {
                width: 100%;

                @screen tablet {
                    margin-bottom: 1.5rem;
                }

                .tab-button {
                    display: flex;
                    align-items: center;
                    .count {
                        font-size: 1.25rem;
                        margin-left: auto;
                    }
                }
            }
        }

        .tab-content-wrapper {
            @apply col-span-9;
            position: relative;

            .filter-wrapper {
                position: absolute;
                display: flex;
                width: 100%;
                top: -2.75rem;

                @screen tablet {
                    position: relative;
                    top: 0;
                    margin-bottom: 1rem;
                }

                .left-part {
                    display: inline-flex;
                    flex-grow: 1;

                    .p-select-status {
                        font-size: 0.875rem;
                        padding-right: 0.5rem;
                        &:last-child {
                            padding-right: 0;
                        }
                    }
                }
                .right-part {
                    display: flex;
                    height: 1.5rem;

                    @screen tablet {
                        display: none;
                    }

                    .p-select-button {
                        margin-right: 0.375rem;
                    }
                }
            }
            .p-list-card::v-deep {
                .card-wrapper {
                    display: flex;

                    @screen mobile {
                        display: block;
                        line-height: 1.5;
                    }

                    .left-part {
                        flex-grow: 1;
                        margin: auto 0;

                        @screen mobile {
                            display: block;
                        }

                        .p-i-icon {
                            margin-right: 0.5rem;
                        }
                        .value {
                            margin-right: 0.5rem;
                        }
                        .project {
                            @apply text-gray-500;

                            @screen mobile {
                                display: block;
                            }
                        }
                    }
                    .right-part {
                        .date {
                            @apply text-gray-500;
                            font-size: 0.75rem;
                            margin-left: 0.5rem;
                        }
                    }
                }

                header {
                    display: none;

                    @screen tablet {
                        display: block;
                    }

                    .mobile-header {
                        display: flex;
                        height: 1.5rem;

                        .p-checkbox {
                            flex-grow: 1;
                            .text {
                                padding-left: 0.375rem;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
