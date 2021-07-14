<template>
    <div class="alert-list-item">
        <div class="content-wrapper">
            <div class="left-part">
                <p-i :name="item.urgency === ALERT_URGENCY.HIGH ? 'ic_alert' : 'ic_state_duplicated'"
                     width="1em" height="1em"
                />
                <span v-tooltip.bottom="item.title" class="title">{{ item.title }}</span>
                <p-badge v-if="showMemberName && item.assignee"
                         outline
                         style-type="primary2"
                         class="member-name"
                >
                    {{ users[item.assignee] ? users[item.assignee].label : item.assignee }}
                </p-badge>
            </div>
            <div class="right-part">
                <p-anchor v-if="showProjectLink"
                          class="project-link"
                          :to="referenceRouter(item.project_id,{ resource_type: 'identity.Project' })"
                          :show-icon="false"
                          target="_self"
                >
                    {{ projects[item.project_id] ? projects[item.project_id].label : item.project_id }}
                </p-anchor>
                <p-badge :style-type="badgeStyleTypeFormatter(item.state)">
                    {{ capitalize(item.state) }}
                </p-badge>
                <span class="date">{{ dateFormatter(item.created_at) }}</span>
            </div>
        </div>
        <div v-if="showStatusMessage && item.status_message" class="status-message">
            <p-i name="ic_reply" width="1rem" height="1rem" />
            <span>{{ item.status_message }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { capitalize } from 'lodash';
import dayjs from 'dayjs';

import {
    PI, PBadge, PAnchor,
} from '@spaceone/design-system';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';


const ALERT_URGENCY = Object.freeze({
    HIGH: 'HIGH',
    LOW: 'LOW',
});
const ALERT_STATE = Object.freeze({
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
});

export default {
    name: 'AlertListItem',
    components: {
        PI,
        PBadge,
        PAnchor,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        showProjectLink: {
            type: Boolean,
            default: false,
        },
        showMemberName: {
            type: Boolean,
            default: false,
        },
        showStatusMessage: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            users: computed(() => store.state.resource.user.items),
        });

        /* util */
        const badgeStyleTypeFormatter = (alertState) => {
            if (alertState === ALERT_STATE.TRIGGERED) return 'red100';
            if (alertState === ALERT_STATE.ACKNOWLEDGED) return 'blue200';
            return 'gray200';
        };
        const dateFormatter = date => dayjs.utc(date).format('MM/DD HH:mm');

        return {
            ...toRefs(state),
            ALERT_URGENCY,
            referenceRouter,
            capitalize,
            badgeStyleTypeFormatter,
            dateFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-list-item {
    .content-wrapper {
        display: -webkit-box;

        .left-part {
            display: inherit;
            flex-grow: 1;
            align-items: center;
            margin: auto 0;

            .p-i-icon {
                @apply flex-shrink-0;
                margin-right: 0.5rem;
            }
            .title {
                @apply truncate;
                display: block;
                width: 90%;
                margin-right: 0.5rem;
            }
        }
        .right-part {
            @apply flex-shrink-0;
            .project-link {
                @apply text-gray-500;
                margin-right: 0.5rem;
            }
            .date {
                @apply text-gray-500;
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

        .left-part {
            .p-i-icon {
                position: absolute;
                left: -0.25rem;
                top: 0.3rem;
            }
            .member-name {
                display: none;
            }
        }
    }
}
</style>
