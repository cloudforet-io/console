<template>
    <div class="alert-list-item">
        <div class="left-part">
            <p-i :name="item.urgency === ALERT_URGENCY.HIGH ? 'ic_alert' : 'ic_state_duplicated'"
                 width="1em" height="1em"
            />
            <span class="title">{{ item.title }}</span>
            <p-anchor v-if="itemType !== ITEM_TYPE.PROJECT"
                      class="project-link"
                      :to="referenceRouter(item.project_id,{ resource_type: 'identity.Project' })"
                      :show-icon="false"
            >
                {{ projects[item.project_id] ? projects[item.project_id].label : item.project_id }}
            </p-anchor>
        </div>
        <div class="right-part">
            <p-badge :style-type="badgeStyleTypeFormatter(item.state)">
                {{ capitalize(item.state) }}
            </p-badge>
            <span class="date">{{ dateFormatter(item.created_at) }}</span>
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
const ITEM_TYPE = Object.freeze({
    DEFAULT: 'DEFAULT',
    PROJECT: 'PROJECT',
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
        itemType: {
            type: String,
            default: ITEM_TYPE.DEFAULT,
            validator(itemType) {
                return Object.values(ITEM_TYPE).includes(itemType);
            },
        },
    },
    setup() {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
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
            ITEM_TYPE,
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
    display: flex;

    .left-part {
        display: inherit;
        flex-grow: 1;
        align-items: center;
        margin: auto 0;

        .p-i-icon {
            margin-right: 0.5rem;
        }
        .title {
            @apply truncate;
            display: block;
            margin-right: 0.5rem;
        }
        .project-link {
            @apply text-gray-500;
            display: inherit;
        }
    }
    .right-part {
        .date {
            @apply text-gray-500;
            font-size: 0.75rem;
            margin-left: 0.5rem;
        }
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
        }
    }
}
</style>
