<script setup lang="ts">
import { PHeading, PButton } from '@spaceone/design-system';

import BookmarkManagementTable from '@/services/preference/components/BookmarkManagementTable.vue';
</script>

<template>
    <div class="admin-bookmark-page">
        <p-heading :title="$t('IAM.BOOKMARK.ALL_BOOKMARK')"
                   class="title"
        >
            <template #extra>
                <div class="extra">
                    <p-button style-type="tertiary"
                              icon-left="ic_delete"
                    >
                        {{ $t('IAM.BOOKMARK.DELETE') }}
                    </p-button>
                    <p-button icon-left="ic_plus">
                        {{ $t('IAM.BOOKMARK.ADD_GLOBAL_BOOKMARK') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <bookmark-management-table />
    </div>
</template>

<style lang="postcss" scoped>
.admin-bookmark-page {
    .title {
        .extra {
            @apply flex;
            gap: 1rem;
        }
    }
}
</style>
