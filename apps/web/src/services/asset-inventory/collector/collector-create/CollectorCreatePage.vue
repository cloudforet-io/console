<template>
    <fragment>
        <div class="collector-creator-page">
            <p-centered-layout-header :title="$t('INVENTORY.COLLECTOR.CREATE.PAGE_TITLE')"
                                      :description="state.descriptionByStep[state.step]"
                                      show-step
                                      :current-step="state.step"
                                      :total-steps="4"
                                      :show-close-button="true"
                                      @close="handleClickClose"
            />
            <create-collector-step1 v-if="state.step===1"
                                    @update:currentStep="handleChangeStep"
            />
            <div v-if="state.step !== 1">
                <keep-alive>
                    <create-collector-step2 v-if="state.step===2"
                                            @update:currentStep="handleChangeStep"
                    />
                    <create-collector-step3 v-if="state.step===3"
                                            @update:currentStep="handleChangeStep"
                    />
                    <create-collector-step4 v-if="state.step===4"
                                            @update:currentStep="handleChangeStep"
                    />
                </keep-alive>
            </div>
        </div>
        <confirm-back-modal :visible.sync="state.deleteModalVisible"
                            @confirm="handleClickBackButton"
        />
    </fragment>
</template>

<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

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
// eslint-disable-next-line import/no-duplicates
import { computed, reactive, defineExpose } from 'vue';

import { PCenteredLayoutHeader } from '@spaceone/design-system';


import { store } from '@/store';
import { i18n } from '@/translations';

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

const state = reactive({
    step: 1,
    deleteModalVisible: false,
    descriptionByStep: computed(() => ({
        1: i18n.t('INVENTORY.COLLECTOR.CREATE.STEP_DESC1'),
        2: i18n.t('INVENTORY.COLLECTOR.CREATE.STEP_DESC2'),
        3: i18n.t('INVENTORY.COLLECTOR.CREATE.STEP_DESC3'),
        4: i18n.t('INVENTORY.COLLECTOR.CREATE.STEP_DESC4'),
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
.close-button {
    position: absolute;
    right: 1.5rem;
    top: 1.5rem;
}

.collector-creator-page {
    margin: 2rem 2.5rem 0 2.5rem;
    max-height: calc(100% - 2rem);
}
</style>
