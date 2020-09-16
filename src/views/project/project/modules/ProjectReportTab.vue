<template>
    <div class="project-report-tab-container">
        <div class="input-lap">
            <p><b>SpaceONE</b> offers Monthly Report based on this project. We will provide more options soon.</p>
            <p-field-group label="Company Name on the Report Cover"
                           :invalid="inputModel.companyName.length === 0"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="inputModel.companyName" class="block" :class="{'is-invalid': invalid}" />
                </template>
            </p-field-group>
            <p-field-group label="Period(Last one month)" class="absolute pl-12" :required="true">
                <p-select-dropdown v-model="inputModel.period" :items="periods" auto-height />
            </p-field-group>
        </div>
        <div class="button-lap">
            <p-button class="txt-btn"
                      style-type="gray900" :outline="true" size="lg"
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
import { reactive, toRefs } from '@vue/composition-api';

import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PHr from '@/components/atoms/hr/PHr.vue';

export default {
    name: 'ProjectReportTab',
    components: {
        PHr,
        PSelectDropdown,
        PButton,
        PTextInput,
        PFieldGroup,
    },
    setup(props, context) {
        const state = reactive({
            inputModel: {
                companyName: '',
                period: '',
            },
            periods: [],
        });

        return {
            ...toRefs(state),
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
        .txt-btn {
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
