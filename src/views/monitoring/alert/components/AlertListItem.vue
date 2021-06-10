<template>
    <div class="alert-list-item">
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

<script lang="ts">
import {
    PI, PBadge,
} from '@spaceone/design-system';

export default {
    name: 'AlertListItem',
    components: {
        PI,
        PBadge,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {

    },
};
</script>

<style lang="postcss" scoped>
.alert-list-item {
    display: flex;

    .left-part {
        display: inherit;
        flex-grow: 1;
        margin: auto 0;

        .p-i-icon {
            margin-right: 0.5rem;
        }
        .value {
            @apply truncate;
            display: block;
            margin-right: 0.5rem;
        }
        .project {
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
