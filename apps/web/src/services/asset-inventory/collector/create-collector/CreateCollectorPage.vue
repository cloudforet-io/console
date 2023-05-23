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
                <!--                song-lang-->
                <p-heading :title="$t('Create New Collector')" />
                <p class="description">
                    {{ state.descriptionByStep[state.step] }}
                </p>
            </div>
            <create-collector-step1 v-if="state.step===1"
                                    @update:currentStep="handleChangeStep"
            />
            <create-collector-step2 v-if="state.step===2"
                                    @update:currentStep="handleChangeStep"
            />
            <create-collector-step3 v-if="state.step===3"
                                    @update:currentStep="handleChangeStep"
            />
            <create-collector-step4 v-if="state.step===4"
                                    @update:currentStep="handleChangeStep"
            />
        </div>
        <!--        song-lang-->
        <delete-modal :header-title="$t('Are you sure you want to quit?')"
                      :visible.sync="state.isDeleteModalVisible"
                      :contents="$t('You cannot undo this action.')"
                      @confirm="handleClose"
        />
    </fragment>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PHeading, PIconButton } from '@spaceone/design-system';


import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import CreateCollectorStep1
    from '@/services/asset-inventory/collector/create-collector/modules/CreateCollectorStep1.vue';
import CreateCollectorStep2
    from '@/services/asset-inventory/collector/create-collector/modules/CreateCollectorStep2.vue';
import CreateCollectorStep3
    from '@/services/asset-inventory/collector/create-collector/modules/CreateCollectorStep3.vue';
import CreateCollectorStep4
    from '@/services/asset-inventory/collector/create-collector/modules/CreateCollectorStep4.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const state = reactive({
    step: 1,
    isDeleteModalVisible: false,
    descriptionByStep: computed(() => ({
        // song-lang
        1: i18n.t('Select a plugin first.'),
        2: i18n.t('Enter Basic Information.'),
        3: i18n.t('Set Advanced Options.'),
        4: i18n.t('Set schedule for automate collecting jobs.'),
    })),
});

const handleClickClose = () => {
    state.isDeleteModalVisible = true;
};

const handleClose = () => {
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME });
};

const handleChangeStep = (step: number) => {
    state.step = step;
};

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
