<script setup lang="ts">
import { computed, defineProps, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeadingLayout, PHeading, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/controls/context-menu/type';

import { i18n } from '@/translations';

interface Props {
    alertId: string;
}

const props = withDefaults(defineProps<Props>(), {
    alertId: '',
});

const router = useRouter();

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
    <div class="alerts-detail-page pb-6">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="props.alertId"
                           show-back-button
                           @click-back-button="router.go(-1)"
                >
                    <template #title-right-extra>
                        <span class="text-label-xl text-gray-700 mr-2">NO.temp number</span>
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
        </p-heading-layout>
    </div>
</template>
