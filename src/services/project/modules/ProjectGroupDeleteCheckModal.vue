<template>
    <delete-modal :header-title="$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE')"
                  :visible.sync="proxyVisible"
                  @confirm="deleteProjectGroup"
    >
        <p>
            {{ $t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.CONTENT') }}
        </p>
        <i18n path="PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DESC" tag="p" class="desc">
            <template #deleteAllSubProjects>
                <strong>{{ $t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DELETE_ALL_SUB_PROJECT') }}</strong>
            </template>
        </i18n>
    </delete-modal>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

export default {
    name: 'ProjectGroupDeleteCheckModal',
    components: {
        DeleteModal,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxyVisible: computed({
                get() { return store.state.service.project.projectGroupDeleteCheckModalVisible; },
                set(val) { store.commit('service/project/setProjectGroupDeleteCheckModalVisible', val); },
            }),
            groupId: computed((() => store.getters['service/project/actionTargetNodeData']?.id)),
        });

        const deleteProjectGroup = async () => {
            try {
                await store.dispatch('service/project/deleteProjectGroup');
                // await store.dispatch('favorite/projectGroup/removeItem', { id: state.groupId });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: vm.$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }), e);
            } finally {
                store.commit('service/project/setProjectGroupDeleteCheckModalVisible', false);
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
