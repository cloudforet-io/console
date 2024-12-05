<script setup lang="ts">
import {
    reactive,
} from 'vue';

import {
    PButton, PButtonModal, PCodeEditor, PToolbox, PEmpty, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';

import { copyAnyData } from '@/lib/helper/copy-helper';

const state = reactive({
    itemList: [],
    totalCount: 0,
    thisPage: 1,
    pageLimit: 10,
    selectedItem: {} as any,
    modalVisible: false,
    isAlertVisible: false,
});

const fetchEventList = () => {
    console.log('TODO: fetchEventList');
};

const handleChangeToolbox = async (options: any = {}) => {
    console.log('TODO: handleChangeToolbox', options);
};

const handleClickShowMore = async () => {
    console.log('TODO: handleClickShowMore');
};

const handleConfirmButton = () => {
    console.log('TODO: handleConfirmButton');
};

const handleClickCopy = () => {
    console.log('TODO: handleClickCopy');
    copyAnyData(state.selectedItem.raw_data);
};

(async () => {
    await fetchEventList();
})();
</script>

<template>
    <section class="alert-detail-tabs-timeline pt-6 px-4 pb-10">
        <p-heading-layout class="pb-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('ALERT_MANAGER.ALERTS.TIMELINE')"
                />
            </template>
        </p-heading-layout>
        <p-toolbox search-type="plain"
                   :total-count="state.totalCount"
                   :page-size-changeable="false"
                   :pagination-visible="false"
                   class="mb-3"
                   @change="handleChangeToolbox"
                   @refresh="handleChangeToolbox"
        />
        <template v-if="state.itemList.length > 0">
            <div>
                timeline section
            </div>
        </template>
        <p-empty v-else>
            {{ $t('ALERT_MANAGER.ALERTS.NO_EVENT') }}
        </p-empty>
        <p-button v-if="state.itemList.length > 9"
                  style-type="secondary"
                  class="flex w-full mt-6"
                  @click="handleClickShowMore"
        >
            {{ $t('ALERT_MANAGER.SHOW_MORE') }}
        </p-button>
        <p-button-modal v-if="state.modalVisible"
                        :header-title="$t('ALERT_MANAGER.ALERTS.EVENT_DETAILS')"
                        size="lg"
                        :visible.sync="state.modalVisible"
                        @confirm="handleConfirmButton"
        >
            <template #body>
                <div class="event-detail-modal-content">
                    <p-code-editor :code="state.selectedItem"
                                   class="code-block"
                                   read-only
                                   folded
                    />
                </div>
            </template>
            <template #footer-extra>
                <div class="footer-extra">
                    <p-button style-type="tertiary"
                              icon-left="ic_copy"
                              @click="handleClickCopy"
                    >
                        {{ $t('ALERT_MANAGER.ALERTS.COPY_ALL') }}
                    </p-button>
                </div>
            </template>
        </p-button-modal>
    </section>
</template>

<style lang="postcss" scoped>
.alert-detail-tabs-timeline {
    .event-detail-modal-content {
        max-height: 20.68rem;
    }
    .code-block {
        min-height: 100%;
    }
}
</style>
