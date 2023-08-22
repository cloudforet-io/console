<template>
    <div class="alert-list-item">
        <div class="content-wrapper">
            <div class="left-part">
                <p-i :name="item.urgency === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                     width="1em"
                     height="1em"
                     :color="item.urgency === ALERT_URGENCY.HIGH ? red[400] : undefined"
                />
                <p-link class="title"
                        :to="{ name: ALERT_MANAGER_ROUTE.ALERT.DETAIL._NAME, params: { id: item.alert_id } }"
                >
                    <span v-tooltip.bottom="item.title">{{ item.title }}</span>
                </p-link>
                <p-badge v-if="showMemberName && item.assignee"
                         style-type="primary1"
                         badge-type="solid-outline"
                         class="member-name"
                >
                    {{ userReference.name || item.assignee }}
                </p-badge>
            </div>
            <div class="right-part">
                <p-link v-if="showProjectLink"
                        v-tooltip.bottom="projectNameFormatter(item.project_id)"
                        class="project-link"
                        :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        :to="referenceRouter(item.project_id,{ resource_type: 'identity.Project' })"
                        hide-icon
                >
                    {{ projectNameFormatter(item.project_id) }}
                </p-link>
                <p-badge :style-type="badgeStyleTypeFormatter(item.state)"
                         badge-type="subtle"
                         class="badge"
                >
                    {{ state.alertStateI18n[item.state] }}
                </p-badge>
                <span class="date">{{ dateFormatter(item.created_at) }}</span>
            </div>
        </div>
        <div v-if="showStatusMessage && item.status_message"
             class="status-message"
        >
            <p-i name="ic_subdirectory-arrow-right"
                 width="1rem"
                 height="1rem"
            />
            <span>{{ item.status_message }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>

import {
    PI, PBadge, PLink,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import dayjs from 'dayjs';
import {
    computed, reactive,
} from 'vue';
import { useStore } from 'vuex';

import type { ReferenceItem } from '@/store/modules/reference/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { red } from '@/styles/colors';

import { useAlertStateI18n } from '@/services/alert-manager/composables/alert-state-i18n';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import type { AlertDataModel } from '@/services/alert-manager/type';

import { ALERT_STATE } from '../lib/config';

const ALERT_URGENCY = Object.freeze({
    HIGH: 'HIGH',
    LOW: 'LOW',
});

interface Props {
    item: AlertDataModel;
    showProjectLink?: boolean;
    showMemberName?: boolean;
    showStatusMessage?: boolean;
    projectReference?: ReferenceItem;
    userReference: ReferenceItem;
}

const props = withDefaults(defineProps<Props>(), {
    item: () => ({}) as AlertDataModel,
    showProjectLink: false,
    showMemberName: false,
    showStatusMessage: false,
    projectReference: () => ({}) as ReferenceItem,
    userReference: () => ({}) as ReferenceItem,
});
const store = useStore();

const state = reactive({
    timezone: computed(() => store.state.user.timezone),
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
