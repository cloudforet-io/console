<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import dayjs from 'dayjs';

import {
    PI, PBadge, PLink,
} from '@cloudforet/mirinae';


import { ALERT_STATE } from '@/schema/monitoring/alert/constants';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { ReferenceItem } from '@/store/reference/type';
import { useUserStore } from '@/store/user/user-store';

import { red } from '@/styles/colors';

import { useAlertStateI18n } from '@/services/alert-manager/v1/composables/alert-state-i18n';
import { ALERT_MANAGER_ROUTE_V1 } from '@/services/alert-manager/v1/routes/route-constant';

const ALERT_URGENCY = Object.freeze({
    HIGH: 'HIGH',
    LOW: 'LOW',
});

const props = withDefaults(defineProps<{
    item: Record<string, any>;
    showProjectLink?: boolean;
    showMemberName?: boolean;
    showStatusMessage?: boolean;
    projectReference?: ReferenceItem;
    userReference?: ReferenceItem;
}>(), {
    item: () => ({}),
    showProjectLink: false,
    showMemberName: false,
    showStatusMessage: false,
    projectReference: () => ({}),
    userReference: () => ({}),
});

const userStore = useUserStore();
const userWorkspaceStore = useUserWorkspaceStore();
const { getReferenceLocation } = useReferenceRouter();

const state = reactive({
    timezone: computed(() => userStore.state.timezone),
    alertStateI18n: useAlertStateI18n(),
});

/* util */
const badgeStyleTypeFormatter = (alertState) => {
    if (alertState === ALERT_STATE.TRIGGERED) return 'red100';
    if (alertState === ALERT_STATE.ACKNOWLEDGED) return 'blue200';
    return 'gray200';
};
const dateFormatter = (date) => {
    const offset = (dayjs().tz(state.timezone).utcOffset());
    const timezoneDate = dayjs(date).utcOffset(offset);
    return timezoneDate.format('MM/DD HH:mm');
};
const projectNameFormatter = (projectId) => props.projectReference?.label || projectId;
</script>

<template>
    <div class="alert-list-item">
        <div class="content-wrapper">
            <div class="left-part">
                <p-i :name="props.item.urgency === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                     width="1em"
                     height="1em"
                     :color="props.item.urgency === ALERT_URGENCY.HIGH ? red[400] : undefined"
                />
                <p-link class="title"
                        :to="{ name: ALERT_MANAGER_ROUTE_V1.ALERTS.DETAIL._NAME, params: { id: props.item.alert_id } }"
                >
                    <span v-tooltip.bottom="props.item.title">{{ props.item.title }}</span>
                </p-link>
                <p-badge v-if="props.showMemberName && props.item.assignee"
                         style-type="primary1"
                         badge-type="solid-outline"
                         class="member-name"
                >
                    {{ props.userReference.name || props.item.assignee }}
                </p-badge>
            </div>
            <div class="right-part">
                <p-link v-if="props.showProjectLink"
                        v-tooltip.bottom="projectNameFormatter(props.item.project_id)"
                        class="project-link"
                        action-icon="internal-link"
                        new-tab
                        :to="getReferenceLocation(props.item.project_id,{
                            resource_type: 'identity.Project',
                            workspace_id: userWorkspaceStore.getters.currentWorkspaceId,
                        })"
                        hide-icon
                >
                    {{ projectNameFormatter(props.item.project_id) }}
                </p-link>
                <p-badge :style-type="badgeStyleTypeFormatter(props.item.state)"
                         badge-type="subtle"
                         class="badge"
                >
                    {{ state.alertStateI18n[props.item.state] }}
                </p-badge>
                <span class="date">{{ dateFormatter(props.item.created_at) }}</span>
            </div>
        </div>
        <div v-if="props.showStatusMessage && props.item.status_message"
             class="status-message"
        >
            <p-i name="ic_subdirectory-arrow-right"
                 width="1rem"
                 height="1rem"
            />
            <span>{{ props.item.status_message }}</span>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.alert-list-item {
    .content-wrapper {
        display: flex;
        justify-content: space-between;
        width: 100%;

        .left-part {
            display: flex;
            flex-shrink: 1;
            flex-grow: 1;
            min-width: 30%;
            align-items: center;

            &:hover {
                .title {
                    text-decoration: underline;
                }
            }

            .p-i-icon {
                @apply flex-shrink-0;
                margin-right: 0.5rem;
            }
            .title {
                @apply truncate;
                display: block;
                max-width: 90%;
                vertical-align: baseline;
                margin-right: 0.5rem;
            }
            .member-name {
                margin-right: 0.5rem;
            }
        }
        .right-part {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            flex-shrink: 0;
            flex-grow: 1;
            max-width: 70%;
            .project-link {
                @apply text-gray-500;
                margin-right: 0.5rem;
            }
            .badge {
                flex-shrink: 0;
                margin: auto 0;
            }
            .date {
                @apply text-gray-500;
                flex-shrink: 0;
                font-size: 0.75rem;
                margin-left: 0.5rem;
            }
        }
    }

    .status-message {
        @apply text-gray-500;
        font-size: 0.75rem;
        padding-left: 1rem;
        padding-top: 0.25rem;
    }

    @screen mobile {
        position: relative;
        display: block;
        line-height: 1.5;
        padding-left: 1rem;

        .content-wrapper {
            display: block;
            .left-part {
                display: block;
                .p-i-icon {
                    position: absolute;
                    left: -0.25rem;
                    top: 0.3rem;
                }
                .title {
                    width: 100%;
                }
                .member-name {
                    display: none;
                }
            }
            .right-part {
                display: block;
                max-width: unset;
            }
        }
    }
}
</style>
