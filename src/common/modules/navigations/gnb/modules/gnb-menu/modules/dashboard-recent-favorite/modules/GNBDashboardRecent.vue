<template>
    <div class="gnb-dashboard-recent">
        <p-data-loader :data="items"
                       :loading="loading"
                       :class="{ loading: loading && !items.length }"
        >
            <template #no-data>
                <div class="no-data">
                    <img class="img"
                         alt="no-data-image"
                         src="@/assets/images/illust_spaceship_3.svg"
                    >
                    <p class="text">
                        {{ $t('COMMON.GNB.RECENT.RECENT_HELP_TEXT') }}
                    </p>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import {
    defineComponent, reactive, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';

export default defineComponent({
    name: 'GNBDashboardRecent',
    components: {
        PDataLoader,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const state = reactive({
            loading: true,
            items: [],
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>
<style lang="postcss" scoped>
.gnb-dashboard-recent {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 13rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 3.75rem);
            overflow-y: auto;
            padding: 1rem 0;
        }
    }
    .no-data {
        text-align: center;
        padding: 3rem 3.25rem;
        .img {
            margin: auto;
        }
        .text {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
        }
    }
}
</style>
