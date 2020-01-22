<template>
    <p-button-modal :header-title="tr('COMMON.COL_DATA')"
                    centered
                    size="lg"
                    fade
                    backdrop
                    :footer-cancel-button-bind="{
                        styleType: 'dark',
                        outline: true,
                    }"
                    :visible.sync="collectDataModalVisible"
                    @confirm="onClickCollectConfirm"
    >
        <template #footer-extra>
            <p-button class="reset-btn"
                      style-type="primary"
                      outline
                      @click="onClickCollectReset"
            >
                {{ tr('COMMON.BTN_RESET') }}
            </p-button>
        </template>
    </p-button-modal>
</template>

<script>
import { toRefs, reactive } from '@vue/composition-api';

const PButtonModal = () => import('@/components/organisms/modals/button-modal/ButtonModal.vue');
const PButton = () => import('@/components/atoms/buttons/Button.vue');
export default {
    name: 'CollectDataModal',
    components: {
        PButtonModal,
        PButton,
    },
    props: {
        collector: Object,
    },
    setup() {
        const state = reactive({
            collectDataModalVisible: false,
        });

        const onClickCollectReset = () => {};

        const onClickCollectConfirm = () => {
        };
        return {
            ...toRefs(state),
            onClickCollectReset,
            onClickCollectConfirm,
        };
    },
};
</script>

<style lang="scss" scoped>

</style>
