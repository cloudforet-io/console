<template>
    <div class="project-report-tab-container">
        <p>{{ $t('PROJECT.DETAIL.REPORT_DESC') }}</p>
        <div class="input-wrapper">
            <p-field-group :label="$t('PROJECT.DETAIL.REPORT_LABEL_COMPANY_NAME')"
                           :invalid="!isValid"
                           :invalid-text="invalidText"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="inputModel.companyName" class="block"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('PROJECT.DETAIL.REPORT_PERIOD')" class="pl-12" :required="true">
                <p-select-dropdown v-model="inputModel.period" :items="periodItems"
                                   disabled auto-height
                />
            </p-field-group>
        </div>
        <div class="button-wrapper">
            <p-icon-text-button
                class="text-button"
                name="ic_download"
                style-type="gray900" :outline="true" size="lg"
                icon-color="inherit inherit"
                :disabled="!isValid"
                @click="onClickDownload"
            >
                {{ $t('PROJECT.DETAIL.DOWNLOAD_FILE') }}
            </p-icon-text-button>
            <p class="help-text">
                {{ $t('PROJECT.DETAIL.REPORT_DOWNLOAD_FILE_DESC') }}
            </p>
        </div>
        <p-divider />
        <div class="example-wrapper">
            <p class="title">
                Sample Report
            </p>
            <div class="image-group">
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
            <div class="image-group">
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
        <p-icon-modal :visible.sync="loading"
                      lottie-name="lottie_interval"
                      :header-title="$t('PROJECT.DETAIL.REPORT_LOADING_TITLE')"
                      :body-text="$t('PROJECT.DETAIL.REPORT_LOADING_DESC')"
                      :button-text="$t('PROJECT.DETAIL.REPORT_CANCEL')"
                      @clickButton="onClickCancel"
        />
    </div>
</template>

<script lang="ts">
import { range } from 'lodash';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import axios, { CancelTokenSource } from 'axios';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PSelectDropdown, PIconModal, PFieldGroup, PIconTextButton, PTextInput, PDivider,
} from '@spaceone/design-system';

import {
    showErrorMessage, downloadURI,
} from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import config from '@/lib/config';
import { store } from '@/store';


export default {
    name: 'ProjectReportTab',
    components: {
        PIconModal,
        PIconTextButton,
        PDivider,
        PSelectDropdown,
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
            timezone: computed(() => store.state.user.timezone || 'UTC'),
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
                let sixMonthAgo = dayjs().subtract(6, 'month');
                let now = dayjs();
                if (state.timezone !== 'UTC') {
                    sixMonthAgo = dayjs().tz(store.state.user.timezone).subtract(6, 'month');
                    now = dayjs().tz(store.state.user.timezone);
                }
                const periods = [] as any[];
                while (now.isAfter(sixMonthAgo, 'day')) {
                    periods.push({
                        name: now.format('YYYY-MM'),
                        label: now.format('YYYY-MM'),
                        type: 'item',
                    });
                    now = now.subtract(1, 'month');
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
                        template_id: config.get('REPORT.DEFAULT_TEMPLATE_ID'),
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
    .input-wrapper {
        margin-bottom: 6.25rem;
        .p-field-group {
            margin-top: 3rem;
            display: inline-block;
        }
        .p-text-input {
            width: 20rem;
        }
    }
    .button-wrapper {
        text-align: right;
        padding-bottom: 1.75rem;
        .text-button {
            width: 12.5rem;
            &.outline {
                &:not(.disabled):hover {
                    @apply border-secondary bg-blue-200 text-secondary;
                }
            }
        }
        .help-text {
            @apply text-gray-400;
            font-size: 0.75rem;
            padding-top: 0.5rem;
        }
    }
    .example-wrapper {
        padding-top: 2rem;
        .title {
            @apply text-gray-500;
            font-size: 0.875rem;
            font-weight: bold;
        }
        .image-group {
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
}
</style>
