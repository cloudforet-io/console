<template>
    <fragment>
        <p-icon-button name="ic_close"
                       color="inherit"
                       class="close-button"
                       @click="handleClickClose"
        />
        <div class="collector-creator-page">
            <div class="header">
                <p class="step">
                    Step {{ state.step }}<span>/4</span>
                </p>
                <p-heading :title="$t('INVENTORY.COLLECTOR.CREATE.PAGE_TITLE')" />
                <p class="description">
                    {{ state.descriptionByStep[state.step] }}
                </p>
            </div>
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
        <delete-modal :header-title="$t('INVENTORY.COLLECTOR.CREATE.CREATE_EXIT_MODAL_TITLE')"
                      :visible.sync="state.deleteModalVisible"
                      :contents="$t('INVENTORY.COLLECTOR.CREATE.CREATE_EXIT_MODAL_CONTENT')"
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

import { PHeading, PIconButton } from '@spaceone/design-system';


import { store } from '@/store';
import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
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
    padding: 1.875rem 0;
    margin: 0 2.5rem;

    .header {
        margin-bottom: 2rem;
        .step {
            @apply text-label-sm text-gray-900;
            span {
                @apply text-gray-500;
            }
        }

        /* custom design-system component - p-heading */
        &:deep(.p-heading.heading-main) {
            margin-bottom: 0.3125rem;
        }
        .description {
            @apply text-label-md text-gray-700;
        }
    }
}
</style>
