<script setup lang="ts">
import { PIconButton, PBreadcrumbs, PCopyButton } from '@spaceone/design-system';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';

const { breadcrumbs } = useBreadcrumbs();

const handleClickMenuButton = () => {
    console.log('click menu!');
};
</script>

<template>
    <div class="gnb-toolbox">
        <div class="navigation-section">
            <p-icon-button name="ic_gnb_menu"
                           style-type="tertiary"
                           class="menu-button"
                           size="md"
                           @click="handleClickMenuButton"
            />
            <p-breadcrumbs v-if="breadcrumbs.length"
                           :routes="breadcrumbs"
            />
        </div>
        <div class="extra-section">
            <b>{{ $t('COMMON.GNB.TOOLBOX.ID') }}: </b>
            <!-- TODO: apply data-->
            <p-copy-button class="copy-button"
                           size="sm"
            >
                data id
            </p-copy-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.gnb-toolbox {
    @apply flex justify-between items-center bg-white border-gray-200 border-b;
    height: $gnb-toolbox-height;
    margin-top: $top-bar-height;
    padding-right: 1rem;
    padding-left: 0.625rem;
    .navigation-section {
        @apply flex items-center;
        gap: 0.625rem;
        .menu-button {
            @apply border-none;
            margin-bottom: -0.025rem;
        }
    }
    .extra-section {
        @apply flex items-center text-gray-500 text-label-sm;
        gap: 0.25rem;
        .copy-button {
            @apply flex items-center text-gray-500;
        }
    }
}
</style>
