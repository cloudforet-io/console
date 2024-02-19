<script setup lang="ts">

import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButtonModal, PButton } from '@spaceone/design-system';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { useProxyValue } from '@/common/composables/proxy-state';

import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

interface Props {
    visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

const appContextStore = useAppContextStore();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});
const router = useRouter();
const handleMoveCreateWorkspace = () => {
    appContextStore.enterAdminMode();
    router.push({
        name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME),
        query: {
            hasNoWorkpspace: 'true',
        },
    });
    state.proxyVisible = false;
};

</script>

<template>
    <p-button-modal class="has-no-workspace-modal"
                    :visible.sync="state.proxyVisible"
                    size="sm"
                    hide-footer
                    hide-header
                    hide-header-close-button
    >
        <template #body>
            <div class="modal-contents-wrapper">
                <img class="ghost-img"
                     src="@/assets/images/img_ghost.png"
                >
                <p class="description">
                    {{ $t('APP.MODAL.WORKSPACE.CREATE_WORKSPACE_DESC') }}
                </p>
                <p-button style-type="primary"
                          size="md"
                          icon-left="ic_plus_bold"
                          @click="handleMoveCreateWorkspace"
                >
                    {{ $t('APP.MODAL.WORKSPACE.CREATE_WORKSPACE_BUTTON') }}
                </p-button>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.has-no-workspace-modal {
    .modal-contents-wrapper {
        @apply flex flex-col items-center;
        padding: 3.75rem 0 2rem;

        .ghost-img {
            width: 5rem;
            height: 5rem;
            margin-bottom: 1.5rem;
        }

        .description {
            @apply text-paragraph-md font-bold text-violet-600;
            margin-bottom: 1rem;
        }
    }
}
</style>
