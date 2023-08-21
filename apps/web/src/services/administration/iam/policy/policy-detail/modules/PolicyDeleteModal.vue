<template>
    <delete-modal
        :visible.sync="proxyVisible"
        :header-title="attachedRoles.length ? $t('IAM.POLICY.MODAL.DELETE_CANNOT_POLICY') : $t('IAM.POLICY.MODAL.DELETE_POLICY')"
        :hide-footer="!!attachedRoles.length"
        class="policy-delete-modal"
        :size="attachedRoles.length ? 'md' : 'sm'"
        @confirm="handleConfirm"
    >
        <template v-if="attachedRoles.length"
                  #delete-modal-body
        >
            <div class="modal-delete-disabled-title">
                <span>{{ $t('IAM.POLICY.MODAL.DELETE_HELP_TEXT') }} </span>
                <p-link
                    :to="{ name: ADMINISTRATION_ROUTE.IAM.ROLE._NAME }"
                    size="lg"
                    highlight
                >
                    {{ $t('IAM.POLICY.MODAL.DELETE_FOLLOW_ROLES') }}
                </p-link>
            </div>
            <p-data-table :fields="fields"
                          :items="attachedRoles"
            />
        </template>
    </delete-modal>
</template>

<script lang="ts">
import { getCurrentInstance, reactive, toRefs } from 'vue';
import type { Vue } from 'vue/types/vue';

import { PLink, PDataTable } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import deleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

export default {
    name: 'PolicyDeleteModal',
    components: {
        deleteModal,
        PLink,
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
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            loading: true,
            proxyVisible: useProxyValue('visible', props, emit),
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'tags.description', label: 'Description' },
                { name: 'role_type', label: 'Type' },
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
                const roleList = await SpaceConnector.client.identity.role.list({
                    policy_id: props.policyId,
                });
                const { results } = roleList;
                state.attachedRoles = results;
            } catch (e) {
                state.attachedRoles = [];
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
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.policy-delete-modal {
    .modal-delete-disabled-title {
        @apply inline-flex items-center;
        vertical-align: middle;
        & > span {
            margin-right: 0.25rem;
        }
    }
    .p-data-table {
        margin-top: 1rem;
    }
}
</style>
