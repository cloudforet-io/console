<template>
    <p-button-modal :header-title="$t('COMMON.TREE_MODAL.TITLE')"
                    size="md"
                    fade
                    backdrop
                    :visible.sync="proxyVisible"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
    >
        <template #body>
            <div class="title">
                {{ $t('COMMON.TREE_MODAL.SELECT_PROJECT') }}
            </div>
            <div class="body-container">
                <div class="radio-row">
                    <p-radio v-model="isToggleSelected"
                             class="mr-2"
                             :value="true"
                    >
                        <span class="radio-text">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_NO_SELECTION') }}</span>
                    </p-radio>
                </div>
                <div class="radio-row">
                    <p-radio v-model="isToggleSelected"
                             class="mr-2"
                             :value="false"
                    >
                        <span class="radio-text">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_SELECT_DESC') }}</span>
                    </p-radio>
                    <div class="search-radio">
                        <project-select-dropdown class="project-search-dropdown"
                                                 project-selectable
                                                 :disabled="isToggleSelected"
                                                 :selected-project-ids="selectedProjectIds"
                                                 :use-fixed-menu-style="true"
                                                 @select="handleSelectedProjectIds"
                        />
                    </div>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from 'vue';
import type { SetupContext } from 'vue';
import type Vue from 'vue';

import { PButtonModal, PRadio } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

export default {
    name: 'ProjectTreeModal',
    components: {
        PRadio,
        PButtonModal,
        ProjectSelectDropdown,
    },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            treeRef: null as null|Vue,
            selectedProjectIds: [] as string[],
            isToggleSelected: false,
            proxyVisible: useProxyValue('visible', props, emit),
        });
        // const autoScroll = (el: HTMLElement) => {
        //     if (state.treeRef.$el) {
        //         const offsetBottom = el.offsetTop + el.offsetHeight;
        //         const scrollBottom = state.treeRef.$el.scrollTop + state.treeRef.$el.offsetHeight;
        //         if (offsetBottom > scrollBottom) {
        //             state.treeRef.$el.scrollTop = offsetBottom - state.treeRef.$el.offsetHeight;
        //         }
        //     }
        // };

        const handleSelectedProjectIds = (selectedProjectIds) => {
            state.selectedProjectIds = selectedProjectIds;
        };

        const handleConfirm = () => {
            if (state.selectedProjectIds.length && !state.isToggleSelected) {
                emit('confirm', state.selectedProjectIds[0]);
            } else {
                emit('confirm', null);
            }
        };
        const handleCancel = () => {
            state.selectedProjectIds = [];
        };
        watch(() => props.projectId, (projectId) => {
            if (projectId?.length) state.selectedProjectIds = [projectId];
        });
        return {
            ...toRefs(state),
            handleConfirm,
            handleCancel,
            handleSelectedProjectIds,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    font-size: 1.375rem;
    line-height: 1.6;
    margin-bottom: 1.2rem;
}
.body-container {
    @apply w-full;
    & > :first-child {
        margin-bottom: 0.625rem;
    }
    .radio-row {
        .radio-text {
            margin-left: 0.40625rem;
        }
    }
    .search-radio {
        margin-left: 1.6rem;
        .project-search-dropdown {
            margin-top: 0.3125rem;
            max-width: 23.5rem;
        }
    }
}
.tree-container {
    @apply overflow-auto flex-grow px-2 py-4;
    height: 21.5rem;
    .project-group-icon {
        @apply mx-1;
    }
}

.no-select {
    @apply border-t border-gray-200 p-4 flex items-center;
}

/* custom design-system component - p-tree */
:deep(.p-tree) {
    .p-tree-node .tree-row {
        .right-extra {
            display: none;
        }
        &:hover .node .right-extra {
            display: block;
        }
    }
}
</style>
