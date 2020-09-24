<template>
    <div class="project-report-tab-container">
        <p><b>SpaceONE</b> offers Monthly Report based on this project. We will provide more options soon.</p>
        <div class="input-lap">
            <p-field-group label="Company Name on the Report Cover"
                           :invalid="!isValid"
                           :invalid-text="invalidText"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="inputModel.companyName" class="block" :class="{'is-invalid': invalid}" />
                </template>
            </p-field-group>
            <p-field-group label="Period(Last one month)" class="pl-12" :required="true">
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
            <p class="title">
                Sample Report
            </p>
            <div class="image-lap">
                <div class="image-box">
                    <img class="image" src="@/assets/images/img_report_1.png">
                </div>
                <div class="image-box">
                    <img class="image" src="@/assets/images/img_report_2.png">
                </div>
                <div class="image-box">
                    <img class="image" src="@/assets/images/img_report_3.png">
                </div>
            </div>
            <div class="image-lap">
                <div class="image-box">
                    <img class="image" src="@/assets/images/img_report_4.png">
                </div>
                <div class="image-box">
                    <img class="image" src="@/assets/images/img_report_5.png">
                </div>
                <div class="image-box">
                    <img class="image" src="@/assets/images/img_report_6.png">
                </div>
            </div>
        </div>
        <p-modal
            :visible="loading"
            :backdrop="true"
        >
            <div class="report-loading-lap">
                <p-lottie class="block" name="lottie_interval"
                          auto :size="5"
                />
                <div class="text-lap">
                    <p class="big-text">
                        Loading...
                    </p>
                    <span class="small-text">Please wait around 10 seconds!</span>
                </div>
                <p-button
                    style-type="gray900" :outline="true"
                    @click="onClickCancel"
                >
                    {{ $t('BTN.CANCEL') }}
                </p-button>
            </div>
        </p-modal>
    </div>
</template>

<script lang="ts">
import { range } from 'lodash';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PHr from '@/components/atoms/hr/PHr.vue';

import {
    getTimezone, MenuItem, showErrorMessage, downloadURI,
} from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import PModal from '@/components/molecules/modals/PModal.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import axios, { CancelTokenSource } from 'axios';

export default {
    name: 'ProjectReportTab',
    components: {
        PLottie,
        PModal,
        PHr,
        PSelectDropdown,
        PButton,
        PTextInput,
        PFieldGroup,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
        projectName: {
            type: String,
            default: '',
        },
    },
    setup(props, { root }) {
        const state = reactive({
            loading: false,
            inputModel: {
                companyName: props.projectName,
                period: '',
            },
            invalidText: computed(() => {
                if (state.inputModel.companyName.length === 0) return 'Should have required property \'name\'';
                if (state.inputModel.companyName.length > 60) return 'Should not be longer than 60 characters';
                return '';
            }),
            isValid: computed(() => !(state.inputModel.companyName.length === 0 || state.inputModel.companyName.length > 60)),
            periodItems: computed(() => {
                const sixMonthAgo = moment().tz(getTimezone()).subtract(6, 'months');
                const now = moment().tz(getTimezone());
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
            downloadRequest: undefined as CancelTokenSource | undefined,
        });

        const onClickDownload = async () => {
            if (!state.isValid) return;
            /* eslint-disable camelcase */
            state.downloadRequest = axios.CancelToken.source();
            state.loading = true;
            try {
                const response = await SpaceConnector.client.report.report.create(
                    {
                        template_id: 'template_2',
                        name: uuidv4(),
                        template_options: {
                            project_id: props.projectId,
                            company_name: state.inputModel.companyName,
                        },
                    },
                    {
                        cancelToken: state.downloadRequest.token,
                    },
                );
                const downloadResponse = await SpaceConnector.client.report.report.getDownloadUrl({
                    report_id: response.report_id,
                });
                downloadURI(downloadResponse.download_url);
                state.downloadRequest = undefined;
            } catch (e) {
                showErrorMessage('Fail to download report', e, root);
            } finally {
                state.loading = false;
            }
        };
        const onClickCancel = () => {
            if (state.downloadRequest) {
                state.downloadRequest.cancel('Next request has been called.');
                state.downloadRequest = undefined;
            }
            state.loading = false;
        };

        const init = () => {
            state.inputModel.period = state.periodItems[0].name;
        };
        init();

        return {
            ...toRefs(state),
            onClickDownload,
            onClickCancel,
            range,
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
        .title {
            @apply text-gray-500;
            font-size: 0.875rem;
            font-weight: bold;
        }
        .image-lap {
            display: flex;
            padding-top: 2rem;
            .image-box {
                @apply w-1/3;
                display: inline-flex;
                padding-left: 1.5rem;
                padding-bottom: 1.5rem;
                &:first-child {
                    padding-left: 0;
                }
                .image {
                    @apply border border-gray-200;
                }
            }
        }
    }
    .report-loading-lap {
        @apply bg-white;
        text-align: center;
        opacity: 0.9;
        border-radius: 1rem;
        padding: 3.75rem;
        margin-top: 50%;
        .text-lap {
            padding-top: 1.5rem;
            padding-bottom: 1.5rem;
            .big-text {
                @apply text-primary-dark;
                font-size: 1.375rem;
                font-weight: bold;
                padding-bottom: 0.5rem;
            }
        }
    }
}
</style>
