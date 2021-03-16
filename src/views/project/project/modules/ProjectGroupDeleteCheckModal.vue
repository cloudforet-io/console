<template>
    <p-button-modal :header-title="$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE')"
                    centered
                    :scrollable="false"
                    size="sm"
                    fade
                    :visible.sync="proxyVisible"
                    theme-color="alert"
                    @confirm="deleteProjectGroup"
    >
        <template #body>
            <div class="delete-modal-contents">
                <p>
                    {{ $t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.CONTENT') }}
                </p>
                <i18n path="PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DESC" tag="p" class="desc">
                    <template #deleteAllSubProjects>
                        <strong>{{ $t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DELETE_ALL_SUB_PROJECT') }}</strong>
                    </template>
                </i18n>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import {
    PButtonModal,
} from '@spaceone/design-system';

export default {
    name: 'ProjectGroupDeleteCheckModal',
    components: {
        PButtonModal,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxyVisible: computed({
                get() { return store.state.projectPage.projectGroupDeleteCheckModalVisible; },
                set(val) { store.commit('projectPage/setProjectGroupDeleteCheckModalVisible', val); },
            }),
            groupId: computed((() => store.getters['projectPage/actionTargetNodeData']?.id)),
        });

        const deleteProjectGroup = async () => {
            try {
                await store.dispatch('projectPage/deleteProjectGroup');
                await store.dispatch('favorite/projectGroup/removeItem', { id: state.groupId });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: vm.$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }), e, vm.$root);
            } finally {
                store.commit('projectPage/setProjectGroupDeleteCheckModalVisible', false);
            }
        };
        return {
            ...toRefs(state),
            deleteProjectGroup,
        };
    },
};
</script>

<style lang="postcss" scoped>
.delete-modal-contents {
    line-height: 1.4;
    .desc {
        @apply mt-1 text-gray-600;
        font-size: 0.875rem;
    }
}
</style>
