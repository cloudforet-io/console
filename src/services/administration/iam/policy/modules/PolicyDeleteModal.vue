<template>
    <delete-modal
        :visible.sync="proxyVisible"
        :header-title="attachedRoles.length ? $t('IAM.POLICY.MODAL.DELETE_CANNOT_POLICY') : $t('IAM.POLICY.MODAL.DELETE_POLICY')"
        :only-show-footer-close-button="!!attachedRoles.length"
        class="policy-delete-modal"
        :size="attachedRoles.length ? 'md' : 'sm'"
        @confirm="handleConfirm"
    >
        <template v-if="attachedRoles.length" #delete-modal-body>
            <div class="modal-delete-disabled-title">
                <span>{{ $t('IAM.POLICY.MODAL.DELETE_HELP_TEXT') }} </span>
                <p-anchor :to="{name: '#'}" size="lg" highlight>
                    {{ $t('IAM.POLICY.MODAL.DELETE_FOLLOW_ROLES') }}
                </p-anchor>
            </div>
            <p-data-table :fields="fields" :items="attachedRoles" />
        </template>
    </delete-modal>
</template>

<script lang="ts">
import { PAnchor, PDataTable } from '@spaceone/design-system';
import { useProxyValue } from '@/common/composables/proxy-state';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import deleteModal from '@/common/components/modals/DeleteModal.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { i18n } from '@/translations';

export default {
    name: 'PolicyDeleteModal',
    components: {
        deleteModal,
        PAnchor,
        PDataTable,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        policyId: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: true,
            proxyVisible: useProxyValue('visible', props, emit),
            fields: [
                { name: 'Name', key: 'name' },
                { name: 'Description', key: 'tags' },
                { name: 'Type', key: 'type' },
            ],
            attachedRoles: [],
        });

        const deletePolicy = async () => {
            try {
                state.loading = true;
                await SpaceConnector.client.identity.policy.delete({
                    policy_id: props.policyId,
                });
                showSuccessMessage(i18n.t('IAM.POLICY.MODAL.ALT_S_DELETE_POLICY'), '');
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.POLICY.MODAL.ALT_S_DELETE_POLICY'));
            } finally {
                state.loading = false;
            }
        };

        const handleConfirm = () => {
            deletePolicy();
            state.proxyVisible = false;
            vm.$router.go(-1);
        };

        const listRoles = async () => {
            try {
                state.attachedRoles = await SpaceConnector.client.identity.role.list({
                    policy_id: props.policyId,
                })?.results ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        (async () => {
            await listRoles();
        })();

        return {
            ...toRefs(state),
            deletePolicy,
            handleConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.policy-delete-modal {
    .modal-delete-disabled-title {
        @apply inline-block;
    }
    .p-data-table {
        margin-top: 1rem;
    }
}
</style>
