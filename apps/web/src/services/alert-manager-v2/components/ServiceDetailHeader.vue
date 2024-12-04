<script setup lang="ts">
import { computed, defineProps, reactive } from 'vue';

import {
    PHeading, PHeadingLayout, PSelectDropdown, PLink, PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/controls/context-menu/type';

import { i18n } from '@/translations';

import { gray } from '@/styles/colors';

interface Props {
    serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
    serviceId: '',
});

const state = reactive({
    menuItems: computed<MenuItem[]>(() => [
        {
            icon: 'ic_edit',
            name: 'edit',
            label: i18n.t('ALERT_MANAGER.EDIT_NAME'),
        },
        {
            icon: 'ic_delete',
            name: 'delete',
            label: i18n.t('ALERT_MANAGER.DELETE'),
        },
    ]),
});

const handleSelectDropdownMenu = () => {
    console.log('TODO: handleSelectDropdownMenu');
};
</script>

<template>
    <div class="service-detail-header">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="props.serviceId"
                           show-back-button
                >
                    <template #title-right-extra>
                        <p-select-dropdown :menu="state.menuItems"
                                           style-type="icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           use-fixed-menu-style
                                           class="bg-white rounded-full border border-gray-300"
                                           reset-selected-on-unmounted
                                           size="sm"
                                           @select="handleSelectDropdownMenu"
                        />
                    </template>
                </p-heading>
            </template>
            <template #extra>
                <p-link :to="undefined"
                        action-icon="internal-link"
                        new-tab
                        class="text-label-md"
                >
                    <span class="pr-0.5">{{ $t('ALERT_MANAGER.SERVICE.SHOW_IN_ALERTS') }}</span>
                </p-link>
            </template>
        </p-heading-layout>
        <div class="service-info-wrapper">
            <div class="info">
                <p-i class="select-marker"
                     name="ic_member"
                     width="0.75rem"
                     height="0.75rem"
                />
                <span>3</span>
                <span>{{ $t('ALERT_MANAGER.SERVICE.USER_GROUP') }}</span>
            </div>
            <p-i name="ic_dot"
                 width="0.125rem"
                 height="0.125rem"
                 :color="gray[500]"
                 class="dot"
            />
            <div class="info">
                <p-i class="select-marker"
                     name="ic_member"
                     width="0.75rem"
                     height="0.75rem"
                />
                <span>3</span>
                <span>{{ $t('ALERT_MANAGER.SERVICE.MEMBERS') }}</span>
            </div>
            <!-- TODO: apply visibility only when desc data is available-->
            <p-i name="ic_dot"
                 width="0.125rem"
                 height="0.125rem"
                 :color="gray[500]"
                 class="dot"
            />
            <p class="truncate">
                temp desc
            </p>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-header {
    @apply flex flex-col;
    padding-bottom: 1.5rem;
    gap: 0.375rem;
    .service-info-wrapper {
        @apply flex items-center text-label-sm;
        padding-left: 2.5rem;
        gap: 0.5rem;
        .info {
            @apply flex items-center text-gray-700;
            gap: 0.125rem;
        }
    }
}
</style>
