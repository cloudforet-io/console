<template>
    <div class="cost-analysis-group-by-more-button">
        <p-popover position="bottom-end" :is-visible.sync="popoverVisible">
            <p-icon-button name="ic_setting" size="sm" style-type="transparent"
                           @click="handleClickSettingButton"
            />
            <template #content>
                <div class="popover-content-wrapper">
                    <div class="group-by-wrapper">
                        <!--    song-lang-->
                        <b>{{ $t('Default') }}</b>
                        <span class="count-text"> ({{ count.default }})</span>
                    </div>
                    <div class="group-by-wrapper">
                        <!--    song-lang-->
                        <b>{{ $t('Tags') }}</b>
                        <span class="count-text"> ({{ count.tags }})</span>
                    </div>
                    <div class="group-by-wrapper">
                        <!--    song-lang-->
                        <b>{{ $t('Additional Info') }}</b>
                        <span class="count-text"> ({{ count.additionalInfo }})</span>
                    </div>
                    <p-button icon="ic_plus_bold" style-type="primary1" :outline="true"
                              @click="handleClickAddMoreButton"
                    >
                        <!--    song-lang-->
                        {{ $t('Add More') }}
                    </p-button>
                </div>
            </template>
        </p-popover>
        <cost-analysis-set-more-modal :visible.sync="addMoreModalVisible" />
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';

import { PIconButton, PPopover, PButton } from '@spaceone/design-system';

import CostAnalysisSetMoreModal from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisSetMoreModal.vue';
import { GROUP_BY } from '@/services/cost-explorer/lib/config';


export default defineComponent({
    name: 'CostAnalysisGroupByMoreButton',
    components: {
        CostAnalysisSetMoreModal,
        PIconButton,
        PPopover,
        PButton,
    },
    props: {
    },
    setup() {
        const state = reactive({
            popoverVisible: false,
            count: {
                default: Object.keys(GROUP_BY).length,
                tags: 0,
                additionalInfo: 0,
            },
            addMoreModalVisible: false,
        });

        /* Event */
        const handleClickSettingButton = () => {
            state.popoverVisible = !state.popoverVisible;
        };
        const handleClose = () => {
            state.popoverVisible = false;
        };
        const handleClickAddMoreButton = () => {
            state.addMoreModalVisible = true;
        };

        return {
            ...toRefs(state),
            handleClickSettingButton,
            handleClose,
            handleClickAddMoreButton,
        };
    },
});
</script>
<style lang="postcss">
.cost-analysis-group-by-more-button {
    /* custom design-system component - p-popover */
    :deep(.p-popover) {
        > .popper {
            padding: 0;
        }
    }
    .popover-content-wrapper {
        display: grid;
        gap: 1.25rem;
        .count-text {
            padding-left: 0.25rem;
        }
    }
}
</style>
