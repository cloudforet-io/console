<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    POverlayLayout, PButton, PToolboxTable, PFieldGroup, PTextInput, PFieldTitle, PEmpty,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';


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
    // data table
    fields: computed(() => [
        { name: 'key', label: 'something', type: 'item' },
        { name: 'value', label: 'table', type: 'item' },
    ]),
});
const {
    forms: { dataSourceName },
    invalidState,
    invalidTexts,
    setForm,
} = useFormValidator({
    dataSourceName: '',
}, {
    dataSourceName: (val: string) => {
        if (val?.length < 2) {
            return 'sdfsdff';
        }
        return true;
    },
});

/* Event */
const handleClickContinue = () => {
    // TODO: add event
};
const handleClickGenerate = () => {
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
            <div class="sidebar-contents">
                <div class="left-part">
                    <div class="data-source-wrapper">
                        data source!
                    </div>
                    <p-toolbox-table :fields="state.fields"
                                     :items="[]"
                                     :searchable="false"
                                     :page-size-changeable="false"
                                     :refreshable="false"
                                     class="view-table-wrapper"
                    >
                        <template #toolbox-left>
                            <div class="toolbox-left-wrapper">
                                <span class="view-table-title">
                                    {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DATA_TABLE') }}
                                </span>
                                <p-button style-type="secondary"
                                          icon-left="ic_refresh"
                                          @click="handleClickGenerate"
                                >
                                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.GENERATE') }}
                                </p-button>
                            </div>
                        </template>
                    </p-toolbox-table>
                </div>
                <div class="right-part">
                    <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DATA_SOURCE_NAME')"
                                   :invalid="invalidState.dataSourceName"
                                   :invalid-text="invalidTexts.dataSourceName"
                                   required
                    >
                        <template #default="{invalid}">
                            <p-text-input :value="dataSourceName"
                                          :invalid="invalid"
                                          placeholder="Data Table"
                                          @update:value="setForm('dataSourceName', $event)"
                            />
                        </template>
                    </p-field-group>
                    <div class="chart-type-wrapper">
                        <p-field-title :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CHART_TYPE')" />
                        <div class="chart-type-select-wrapper">
                            <p-empty show-image
                                     image-size="sm"
                                     class="empty-box"
                                     :title="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SELECT_A_DATA_SOURCE')"
                            >
                                {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.EMPTY_DESC') }}
                            </p-empty>
                        </div>
                    </div>
                </div>
            </div>
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
.sidebar-contents {
    width: 100%;
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    .left-part {
        @apply bg-gray-150 rounded-md;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        padding: 0.125rem;
        .data-source-wrapper {
            flex: 1;
        }
        .view-table-wrapper {
            @apply rounded-md;
            max-height: 20rem;
            .toolbox-left-wrapper {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                .view-table-title {
                    @apply text-label-lg font-bold;
                }
            }
        }
    }
    .right-part {
        display: flex;
        flex-direction: column;
        width: 25%;
        min-width: 2rem;
        .chart-type-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            .chart-type-select-wrapper {
                flex: 1;
                .empty-box {
                    height: 100%;
                }
            }
        }
    }
}
.footer-wrapper {
    @apply border-t border-gray-200;
    display: flex;
    align-items: center;
    justify-content: right;
    padding-right: 1.5rem;
}
</style>
