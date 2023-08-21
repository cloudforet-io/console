<template>
    <div class="collector-creator-page">
        <p-centered-layout-header :title="t('INVENTORY.COLLECTOR.CREATE.PAGE_TITLE')"
                                  :description="state.descriptionByStep[state.step]"
                                  show-step
                                  :current-step="state.step"
                                  :total-steps="4"
                                  :show-close-button="true"
                                  @close="handleClickClose"
        />
        <create-collector-step1 v-if="state.step===1"
                                @update:current-step="handleChangeStep"
        />
        <div v-if="state.step !== 1">
            <keep-alive>
                <create-collector-step2 v-if="state.step===2"
                                        @update:current-step="handleChangeStep"
                />
                <create-collector-step3 v-if="state.step===3"
                                        @update:current-step="handleChangeStep"
                />
                <create-collector-step4 v-if="state.step===4"
                                        @update:current-step="handleChangeStep"
                />
            </keep-alive>
        </div>
    </div>
    <confirm-back-modal v-model:visible="state.deleteModalVisible"
                        @confirm="handleClickBackButton"
    />
    <div v-if="state.step !== 1">
        <keep-alive>
            <create-collector-step2 v-if="state.step===2"
                                    @update:current-step="handleChangeStep"
            />
            <create-collector-step3 v-if="state.step===3"
                                    @update:current-step="handleChangeStep"
            />
            <create-collector-step4 v-if="state.step===4"
                                    @update:current-step="handleChangeStep"
            />
        </keep-alive>
    </div>
    <delete-modal v-model:visible="state.deleteModalVisible"
                  :header-title="t('INVENTORY.COLLECTOR.CREATE.CREATE_EXIT_MODAL_TITLE')"
                  :contents="t('INVENTORY.COLLECTOR.CREATE.CREATE_EXIT_MODAL_CONTENT')"
                  @confirm="handleClickBackButton"
    />
</template>

<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

// TODO: need to implement
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
});
</script>

<script lang="ts" setup>
/* eslint-disable import/first */
// eslint-disable-next-line import/order
import { PCenteredLayoutHeader } from '@spaceone/design-system';
import { computed, reactive, defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useGoBack } from '@/common/composables/go-back';

import CreateCollectorStep1
    from '@/services/asset-inventory/collector/collector-create/modules/CreateCollectorStep1.vue';
import CreateCollectorStep2
    from '@/services/asset-inventory/collector/collector-create/modules/CreateCollectorStep2.vue';
import CreateCollectorStep3
    from '@/services/asset-inventory/collector/collector-create/modules/CreateCollectorStep3.vue';
import CreateCollectorStep4
    from '@/services/asset-inventory/collector/collector-create/modules/CreateCollectorStep4.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';


const store = useStore();
const { t } = useI18n();

const state = reactive({
    step: 1,
    deleteModalVisible: false,
    descriptionByStep: computed(() => ({
        1: t('INVENTORY.COLLECTOR.CREATE.STEP_DESC1'),
        2: t('INVENTORY.COLLECTOR.CREATE.STEP_DESC2'),
        3: t('INVENTORY.COLLECTOR.CREATE.STEP_DESC3'),
        4: t('INVENTORY.COLLECTOR.CREATE.STEP_DESC4'),
    })),
});
const { setPathFrom, handleClickBackButton } = useGoBack({ name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME });

const handleClickClose = () => {
    state.deleteModalVisible = true;
};

const handleChangeStep = (step: number) => {
    state.step = step;
};

defineExpose({ setPathFrom });


(() => {
    store.dispatch('reference/provider/load');
})();
</script>

<style lang="postcss" scoped>
.collector-creator-page {
    display: flex;
    flex-direction: column;
}
</style>
