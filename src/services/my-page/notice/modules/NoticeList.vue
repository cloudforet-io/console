<template>
    <div class="notice-list">
        <div class="notice-header">
            <p-toolbox :pagination-visible="false" :page-size-changeable="false" :refreshable="false">
                <template #left-area>
                    <p-select-dropdown :items="dropdownItems" :selected="selectedItem" />
                </template>
            </p-toolbox>
        </div>
        <!-- todo: list-item-->
        <ul v-if="noticeItems.length" class="list-wrapper">
            <li v-for="(item, index) in noticeItems"
                :key="`notice-${item}-${index}`"
            >
                {{ item }}
            </li>
        </ul>
        <div v-else class="no-data">
            <img src="@/assets/images/illust_satellite.svg" class="no-data-img">
            <p class="no-data-text">
                <!--song-lang-->
                {{ $t('No notices') }}
            </p>
        </div>
        <div class="pagination-wrapper">
            <p-pagination class="pagination"
                          :total-count="noticeItems.length"
                          :page-size="10"
                          :current-page="1"
            />
        </div>
    </div>
</template>

<script lang="ts">

import { reactive, toRefs } from '@vue/composition-api';

import {
    PPagination, PSelectDropdown, PToolbox,
} from '@spaceone/design-system';

export default {
    name: 'NoticeList',
    components: {
        PToolbox,
        PSelectDropdown,
        PPagination,
    },
    props: {
        noticeItems: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: true,
        },
    },
    setup() {
        const state = reactive({
            dropdownItems: [
                {
                    // song-lang
                    label: '전체 공지',
                    name: 'all',
                },
                {
                    // song-lang
                    label: '시스템 공지',
                    name: 'system',
                },
                {
                    // song-lang
                    label: '내부 공지',
                    name: 'internal',
                },
            ],
            selectedItem: 'all',
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.notice-list {
    @apply border border-gray-200 bg-white rounded-lg;
}
.notice-header {
    padding: 0 1rem;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
}
.list-wrapper {
    @apply border-t border-b border-gray-200 rounded-none;
    li {
        @apply border-b border-gray-200;
        &:hover {
            @apply bg-blue-100;
        }
    }
    li:last-child {
        @apply border-b-0;
    }
}
.pagination-wrapper {
    @apply flex justify-center;
    padding: 0.75rem 0 1rem 0;
}
.no-data {
    @apply border-t border-b border-gray-200 rounded-none;
    padding: 6rem 0;
    .no-data-img {
        @apply ml-auto mr-auto;
        width: 12rem;
    }

    .no-data-text {
        @apply text-gray-300;
        text-align: center;
        margin-top: 2rem;
        font-size: 1rem;
        line-height: 1.25;
    }
}

</style>
