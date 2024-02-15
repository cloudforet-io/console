<script setup lang="ts">
import { reactive } from 'vue';

import { PIconButton, PBreadcrumbs, PCopyButton } from '@spaceone/design-system';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    isMinimizeGnb?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isMinimizeGnb: false,
});

const { breadcrumbs } = useBreadcrumbs();

const emit = defineEmits<{(event: 'update:is-minimize-gnb'): void;
}>();

const state = reactive({
    proxyIsMinimizeGnb: useProxyValue('isMinimizeGnb', props, emit),
});

const handleClickMenuButton = () => {
    state.proxyIsMinimizeGnb = !state.proxyIsMinimizeGnb;
};
</script>

<template>
    <div class="gnb-toolbox">
        <div class="navigation-section">
            <p-icon-button name="ic_gnb_menu"
                           style-type="transparent"
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
    @apply justify-between border-b border-t;
    top: 0;
    width: 100%;
    height: $gnb-toolbox-height;
    padding-right: 1rem;
    padding-left: 0.625rem;
    .navigation-section {
        @apply flex items-center;
        gap: 0.625rem;
        .menu-button {
            @apply border-none text-gray-900;
            margin-bottom: -0.025rem;
            &:hover {
                @apply text-blue-600;
            }
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
