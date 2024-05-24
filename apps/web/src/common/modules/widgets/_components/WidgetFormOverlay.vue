<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PButton, POverlayLayout,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormOverlayStep1 from '@/common/modules/widgets/_components/WidgetFormOverlayStep1.vue';


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
            // TODO: add sub title
            return i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.ADD_WIDGET');
        }
        return i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.EDIT_WIDGET');
    }),
});

/* Event */
const handleClickContinue = () => {
    // TODO: add event
};
</script>

<template>
    <div>
        <p-overlay-layout :visible.sync="state.proxyVisible"
                          style-type="primary"
                          size="lg"
                          :title="state.sidebarTitle"
        >
            <widget-form-overlay-step1 />
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
