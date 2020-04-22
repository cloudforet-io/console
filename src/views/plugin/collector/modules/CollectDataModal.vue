<template>
    <p-button-modal :header-title="$t('COMMON.COL_DATA')"
                    centered
                    size="xl"
                    fade
                    backdrop
                    :loading="loading"
                    :footer-cancel-button-bind="{
                        styleType: 'gray900',
                        outline: true,
                    }"
                    :footer-confirm-button-bind="confirmBtnStyle"
                    :visible.sync="proxyVisible"
                    @confirm="onClickCollectConfirm"
    >
        <template #body>
            <p-row>
                <p-col class="left-container" :flex-grow="0">
                    <p-row>
                        <p-col class="img-container" :flex-grow="0">
                            <img :src="image">
                        </p-col>
                        <p-col>
                            <p class="name">
                                {{ collector.name }}
                            </p>
                            <p class="info">
                                Collector ID: {{ collector.collector_id }}
                            </p>
                            <p class="info">
                                Version: {{ version }}
                            </p>
                        </p-col>
                    </p-row>
                    <p class="desc">
                        {{ description }}
                    </p>
                    <p class="sub-header">
                        {{ $t('INVENTORY.COL_OPS') }}
                    </p>
                    <p-field-group :label="isCredentialType ?$t('COMMON.CREDENTIAL') :$t('COMMON.CREDENTIAL_GRP')">
                        <div v-if="isCredentialType">
                            <p-text-input :value="credentials[0] ? credentials[0].name : ''"
                                          disabled
                            />
                        </div>
                        <div v-else>
                            <p-select-dropdown v-model="selectedCrdId" :items="crdsMenu" />
                        </div>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.COL_MODE')">
                        <p-select-dropdown v-model="selectedCollectMode" :items="collectModeMenu" />
                    </p-field-group>
                </p-col>
                <p-col class="right-container">
                    <p class="sub-header">
                        {{ $t('INVENTORY.FILTERS') }}
                    </p>
                    <p-dynamic-form v-for="(form, idx) in filterFormats" :key="idx"
                                    v-model="filters[form.key]"
                                    :form="form"
                                    :invalid="showValidation ? vdApi.invalidState[form.key] : false"
                                    :invalid-text="vdApi.invalidMsg[form.key]"
                    />
                </p-col>
            </p-row>
        </template>

        <template #footer-extra>
            <p-button class="reset-btn"
                      style-type="primary-dark"
                      outline
                      size="lg"
                      :disabled="loading"
                      @click="onClickReset"
            >
                {{ $t('BTN.RESET') }}
            </p-button>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, defineComponent, SetupContext,
} from '@vue/composition-api';
import _ from 'lodash';
import config from '@/lib/config';
import { makeTrItems } from '@/lib/view-helper/index';
import { makeProxy } from '@/lib/compostion-util';

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
// @ts-ignore
import PDynamicForm, { setValidation } from '@/components/organisms/forms/dynamic-form/DynamicForm.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import { fluentApi } from '@/lib/fluent-api';
import { CollectParameter } from '@/lib/fluent-api/inventory/collector';
import { AxiosResponse } from 'axios';


export default defineComponent({
    name: 'CollectDataModal',
    components: {
        PButtonModal,
        PButton,
        PDynamicForm,
        PFieldGroup,
        PRow,
        PCol,
        PTextInput,
        PDropdownMenuBtn,
        PSelectDropdown,
    },
    props: {
        collector: {
            type: Object,
            default: () => ({}),
        },
        visible: Boolean,
    },
    setup(props, context: SetupContext) {
        const state = reactive({
            loading: false,
            credentials: [],
            proxyVisible: makeProxy('visible', props, context.emit),
            isCredentialType: computed(() => !!props.collector.plugin_info.credential_id),
            showValidation: false,
            collectModeMenu: makeTrItems([
                ['ALL', 'COMMON.ALL'],
                ['CREATE', 'BTN.CREATE'],
                ['UPDATE', 'BTN.UPDATE'],
            ], context.parent, { type: 'item' }),
            selectedCollectMode: 'ALL',
            image: computed(() => _.get(props.collector, 'tags.icon', config.get('COLLECTOR_IMG'))),
            version: computed(() => _.get(props.collector, 'plugin_info.version', '')),
            description: computed(() => _.get(props.collector, 'tags.description', '')),
            filterFormats: computed(() => _.get(props.collector, 'plugin_info.options.filter_format', [])),
            filters: {},
            confirmBtnStyle: computed(() => {
                const defaultStyle: any = { style: { padding: 0 } };
                defaultStyle.styleType = state.loading ? 'gray200' : 'primary-dark';
                return defaultStyle;
            }),
            crdsMenu: computed(() => [
                // @ts-ignore
                { type: 'item', label: context.parent.$t('COMMON.ALL'), name: 'all' },
                ...state.credentials.map((crd: any) => ({ type: 'item', label: crd.name, name: crd.credential_id })),
            ]),
            selectedCrdId: 'all',
        });

        const collectorApi = fluentApi.inventory().collector();
        const secretManagerApi = fluentApi.secret();

        let vdApi = setValidation(state.filterFormats, state.filters);

        const onChange = async (val) => {
            if (!state.showValidation) return;
            await vdApi.fieldValidation(val);
            context.emit('changeValidState', vdApi.isAllValid);
        };

        const onClickReset = () => {
            if (state.loading) return;

            state.selectedCollectMode = 'ALL';
            state.showValidation = false;
            state.filters = {};
            vdApi = setValidation(state.filterFormats, state.filters);
            state.selectedCrdId = 'all';
        };

        const getParams = (): CollectParameter => {
            const params: CollectParameter = {
                // eslint-disable-next-line camelcase
                collector_id: props.collector.collector_id,
                // eslint-disable-next-line camelcase
                collect_mode: state.selectedCollectMode,
            };

            if (!_.isEmpty(state.filters)) params.filter = state.filters;

            // eslint-disable-next-line camelcase
            if (state.selectedCrdId === 'all') params.credential_group_id = props.collector.plugin_info.credential_group_id;
            // eslint-disable-next-line camelcase
            else params.credential_id = state.selectedCrdId;

            return params;
        };
        const onClickCollectConfirm = async () => {
            state.loading = true;
            state.showValidation = true;
            if (await vdApi.allValidation()) {
                try {
                    await collectorApi.collect().setParameter(getParams()).execute();
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'success',
                        text: 'Collect Data',
                        duration: 2000,
                        speed: 1000,
                    });
                } catch (e) {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: 'Request Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                }
            }
            state.loading = false;
        };


        const listCredentials = async () => {
            if (state.credentials.length > 0) return;
            state.loading = true;
            let res: AxiosResponse;
            if (state.isCredentialType) {
                res = await secretManagerApi.secret().list()
                    .setSecretId(props.collector.plugin_info.credential_id)
                    .execute();
            } else {
                res = await secretManagerApi.secret().list()
                    .setSecretGroupId(props.collector.plugin_info.credential_group_id)
                    .execute();
            }
            state.credentials = res.data.results;
            state.loading = false;
        };

        listCredentials();

        return {
            ...toRefs(state),
            vdApi,
            onChange,
            onClickReset,
            onClickCollectConfirm,
        };
    },
});
</script>

<style lang="postcss" scoped>
.left-container {
    @apply border-r border-gray-200;
    padding-right: 2.5rem;
    .img-container {
        padding-right: 2.5rem;
        img {
            width: 5.5rem;
            height: 5.5rem;
        }
    }
    .name {
        font-size: 1.125rem;
        margin-bottom: 1rem;
    }
    .info {
        font-size: .875rem;
    }
    .desc {
        margin-top: 1rem;
        margin-bottom: 2rem;
        font-size: .875rem;
    }
}
.right-container {
    padding-left: 2.5rem;
}
.sub-header {
    @apply text-gray-400;
    margin-bottom: .875rem;
    font-size: .875rem;
    font-weight: bold;
}
.reset-btn {
    margin-right: auto;
}
.confirm-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    .spinner {
        display: inline-flex;
        padding-right: .25rem;
    }
}
</style>
