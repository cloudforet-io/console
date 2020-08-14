<template>
    <p-button-modal :header-title="$t('INVENTORY.VERIFY_CRD')"
                    theme-color="safe"
                    centered
                    size="lg"
                    fade
                    backdrop
                    :footer-cancel-button-bind="{
                        styleType: 'gray900',
                        outline: true,
                    }"
                    :footer-confirm-button-bind="confirmBtnStyle"
                    :visible.sync="proxyVisible"
                    @confirm="onClickCollectConfirm"
    >
        <template #body>
            <p-data-table :items="items"
                          :fields="fields"
                          hover
            >
                <template #col-verified-format="{index}">
                    <span v-if="!isVerifiedItems[index]" class="verified-col">
                        <p-i name="ic_check" width="1rem"
                             height="1rem" color="transparent inherit"
                        />
                    </span>
                </template>
                <template #col-created_at-format="{value}">
                    {{ timestampFormatter(value) }}
                </template>
            </p-data-table>
        </template>

        <template #confirm-button>
            <div class="confirm-btn">
                <p-lottie v-if="loading" class="spinner"
                          name="thin-spinner"
                          auto
                          :size="1.5"
                />
                <span>{{$t('BTN.CONFIRM') }}</span>
            </div>
        </template>
    </p-button-modal>
</template>

<script>
import { reactive, toRefs, computed } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import { makeTrItems } from '@/lib/view-helper';
import { timestampFormatter } from '@/lib/util';
import CollectorEventBus from '@/views/plugin/collector/CollectorEventBus';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

export const crdVerifyState = reactive({
    loading: false,
    isVerifiedItems: [],
});

export default {
    name: 'CredentialVerifyModal',
    components: {
        PButtonModal,
        PDataTable,
        PI,
        PLottie,
    },
    props: {
        visible: Boolean,
        items: Array,
    },
    setup(props, { emit, parent }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            confirmBtnStyle: computed(() => {
                const defaultStyle = { style: { padding: 0 } };
                defaultStyle.styleType = crdVerifyState.loading ? 'gray200' : 'safe';
                return defaultStyle;
            }),
            fields: makeTrItems([
                ['verified', 'COMMON.VERIFIED', { size: '400px' }],
                ['credential_id', 'COMMON.ID', { size: '400px' }],
                ['name', 'COMMON.NAME', { size: '400px' }],
                ['issue_type', 'COMMON.ISSUE_TYPE', { size: '400px' }],
                ['created_at', 'COMMON.CREATED', { size: '300px' }],
            ], parent),
        });

        const onClickCollectConfirm = () => {
            CollectorEventBus.$emit('verifyCredentials');
        };

        return {
            ...toRefs(state),
            ...toRefs(crdVerifyState),
            onClickCollectConfirm,
            timestampFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .confirm-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        .spinner {
            display: inline-flex;
            padding-right: .25rem;
        }
    }
    .verified-col {
        @apply text-safe;
        display: flex;
        justify-content: center;
    }
</style>
