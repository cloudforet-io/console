<template>
    <div class="set-filter-part">
        <p class="applied-filter">
            <span class="label">Applied Filter:</span><span class="count"> 55 Projects & 20 Service Accounts</span>
        </p>
        <p-button
            style-type="gray-border"
            size="sm"
            @click.stop="handleClickFilter"
        >
            View Filter
        </p-button>
        <div class="left-divider">
            <p-icon-button name="ic_setting" style-type="gray900" size="sm"
                           outline
            />
        </div>
    </div>
</template>

<script lang="ts">
import { PButton, PIconButton } from '@spaceone/design-system';

export default {
    name: 'CostDashboardFilter',
    components: {
        PButton,
        PIconButton,
    },
    props: {
        defaultFilter: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        const handleClickFilter = () => {
            console.log('click more!');
        };
        return {
            handleClickFilter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.set-filter-part {
    @apply flex items-center;
    width: 100%;
    .applied-filter {
        margin-right: 0.5rem;
        .count {
            @apply text-gray-800;
        }
    }
}

@screen mobile {
    .set-filter-part {
        @apply flex flex-wrap;
        .applied-filter {
            width: 100%;
            .label {
                display: none;
            }
        }
    }
}
</style>
