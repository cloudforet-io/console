<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PButton, POverlayLayout,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormOverlayStep1 from '@/common/modules/widgets/_components/WidgetFormOverlayStep1.vue';
import WidgetFormOverlayStep2 from '@/common/modules/widgets/_components/WidgetFormOverlayStep2.vue';


interface Props {
    visible: boolean;
    overlayType?: 'ADD' | 'EDIT';
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    overlayType: 'ADD',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    sidebarTitle: computed(() => {
        if (props.overlayType === 'ADD') {
            const _title = i18n.t('DASHBOARDS.WIDGET.OVERLAY.ADD_WIDGET');
            let _subTitle = i18n.t('DASHBOARDS.WIDGET.OVERLAY.SET_DATA_SOURCE');
            if (state.currentStep === 2) {
                _subTitle = i18n.t('DASHBOARDS.WIDGET.OVERLAY.SET_CHART_OPTIONS');
            }
            return `${_title} - ${_subTitle}`;
        }
        return i18n.t('DASHBOARDS.WIDGET.OVERLAY.EDIT_WIDGET');
    }),
    currentStep: 1,
});

/* Event */
const handleClickContinue = () => {
    state.currentStep += 1;
};
</script>

<template>
    <div>
        <p-overlay-layout :visible.sync="state.proxyVisible"
                          style-type="primary"
                          size="full"
                          :title="state.sidebarTitle"
        >
            <widget-form-overlay-step1 v-if="state.currentStep === 1" />
            <widget-form-overlay-step2 v-if="state.currentStep === 2" />
            <template #footer>
                <div class="footer-wrapper">
                    <p-button style-type="substitutive"
                              icon-right="ic_arrow-right"
                              @click="handleClickContinue"
                    >
                        {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CONTINUE') }}
                    </p-button>
                </div>
            </template>
        </p-overlay-layout>
    </div>
</template>

<style lang="scss" scoped>
.footer-wrapper {
    @apply border-t border-gray-200;
    display: flex;
    align-items: center;
    justify-content: right;
    padding-right: 1.5rem;
}
</style>
