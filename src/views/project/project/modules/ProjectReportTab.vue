<template>
    <div class="project-report-tab-container">
        <p><b>SpaceONE</b> offers Monthly Report based on this project. We will provide more options soon.</p>
        <div class="input-lap">
            <p-field-group label="Company Name on the Report Cover"
                           :invalid="typeof inputModel.companyName === 'string' && !isValid"
                           :invalid-text="invalidText"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="inputModel.companyName" class="block" :class="{'is-invalid': invalid}" />
                </template>
            </p-field-group>
            <p-field-group label="Period(Last one month)" class="absolute pl-12" :required="true">
                <p-select-dropdown v-model="inputModel.period" :items="periodItems"
                                   disabled auto-height
                />
            </p-field-group>
        </div>
        <div class="button-lap">
            <p-button class="text-button"
                      style-type="gray900" :outline="true" size="lg"
                      :disabled="!isValid"
                      @click="onClickDownload"
            >
                Download file
            </p-button>
            <p class="help-text">
                *We provide file formats (including PDF, PPTX, CSV)
            </p>
        </div>
        <p-hr />
        <div class="example-lap">
            <p>Report Example:</p>
        </div>
    </div>
</template>

<script lang="ts">
import moment from 'moment';

import { computed, reactive, toRefs } from '@vue/composition-api';

import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PHr from '@/components/atoms/hr/PHr.vue';

import { getTimezone, MenuItem } from '@/lib/util';

export default {
    name: 'ProjectReportTab',
    components: {
        PHr,
        PSelectDropdown,
        PButton,
        PTextInput,
        PFieldGroup,
    },
    setup() {
        const state = reactive({
            inputModel: {
                companyName: undefined,
                period: '',
            },
            invalidText: computed(() => {
                if (typeof state.inputModel.companyName === 'string') {
                    if (state.inputModel.companyName.length === 0) return 'Should have required property \'name\'';
                    if (state.inputModel.companyName.length > 60) return 'Should not be longer than 60 characters';
                }
                return '';
            }),
            isValid: computed(() => {
                if (state.inputModel.companyName) {
                    return !(state.inputModel.companyName.length === 0 || state.inputModel.companyName.length > 60);
                }
                return false;
            }),
            periodItems: computed(() => {
                const sixMonthAgo = moment().tz(getTimezone()).subtract(6, 'months');
                const now = moment().tz(getTimezone()).subtract(1, 'month');
                const periods = [] as MenuItem[];
                while (now.isAfter(sixMonthAgo)) {
                    periods.push({
                        name: now.format('YYYY-MM'),
                        label: now.format('YYYY-MM'),
                        type: 'item',
                    });
                    now.subtract(1, 'month');
                }
                return periods;
            }),
        });

        const onClickDownload = () => {

        };

        const init = () => {
            state.inputModel.period = state.periodItems[0].name;
        };
        init();

        return {
            ...toRefs(state),
            onClickDownload,
        };
    },
};
</script>

<style lang="postcss">
.project-report-tab-container {
    @apply bg-white border border-gray-200;
    border-radius: 0.125rem;
    font-size: 0.875rem;
    padding: 2rem 1.5rem;
    .input-lap {
        margin-bottom: 6.25rem;
        .p-field-group {
            margin-top: 3rem;
            display: inline-block;
        }
        .p-text-input {
            width: 20rem;
        }
    }
    .button-lap {
        text-align: right;
        padding-bottom: 1.75rem;
        .text-button {
            width: 12.5rem;
        }
        .help-text {
            @apply text-gray-400;
            font-size: 0.75rem;
            padding-top: 0.5rem;
        }
    }
    .example-lap {
        padding-top: 2rem;
    }
}
</style>
