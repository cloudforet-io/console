<template>
    <p-button-modal :header-title="$t('COMMON.COL_DATA')"
                    centered
                    size="xl"
                    fade
                    backdrop
                    :loading="loading"
                    :footer-cancel-button-bind="{
                        styleType: 'dark',
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
                            <p-text-input :value="selectedCrd ? selectedCrd.name : ''"
                                          disabled
                            />
                        </div>
                        <div v-else>
                            <p-dropdown-menu-btn :menu="crdsMenu" @clickMenuEvent="onClickCrdMenu">
                                {{ crdsMenu[crdMenuIdx].label }}
                            </p-dropdown-menu-btn>
                        </div>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.COL_MODE')">
                        <p-dropdown-menu-btn :menu="collectModeMenu">
                            {{ collectModeMenu[collectModeIdx].label }}
                        </p-dropdown-menu-btn>
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

<script>
import { toRefs, reactive, computed } from '@vue/composition-api';
import _ from 'lodash';
import config from '@/lib/config';
import { makeTrItems } from '@/lib/view-helper';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { makeProxy } from '@/lib/compostion-util';
import { defaultAutocompleteHandler } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDynamicForm, { setValidation } from '@/components/organisms/forms/dynamic-form/DynamicForm.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';


export default {
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
    },
    props: {
        collector: Object,
        visible: Boolean,
        loading: Boolean,
        credentials: Array,
        isCredentialType: Boolean,
    },
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
            showValidation: false,
            collectModeIdx: 0,
            collectModeMenu: makeTrItems([
                ['ALL', 'COMMON.ALL'],
                ['CREATE', 'BTN.CREATE'],
                ['UPDATE', 'BTN.UPDATE'],
            ], context.parent, { type: 'item' }),
            image: computed(() => _.get(props.collector, 'tags.icon', config.get('COLLECTOR_IMG'))),
            version: computed(() => _.get(props.collector, 'plugin_info.version', '')),
            description: computed(() => _.get(props.collector, 'tags.description', '')),
            filterFormats: computed(() => _.get(props.collector, 'plugin_info.options.filter_format', [])),
            filters: {},
            confirmBtnStyle: computed(() => {
                const defaultStyle = { style: { padding: 0 } };
                defaultStyle.styleType = props.loading ? 'gray2' : 'primary-dark';
                return defaultStyle;
            }),
            crdsMenu: computed(() => [
                { type: 'item', label: context.parent.$t('COMMON.ALL'), name: 'all' },
                ...props.credentials.map(crd => ({ type: 'item', label: crd.name, name: crd.credential_id })),
            ]),
            crdMenuIdx: 0,
            selectedCrd: computed(() => {
                if (props.isCredentialType) return props.credentials[0];
                if (state.crdMenuIdx === 0) return null;
                return props.credentials[state.crdMenuIdx - 1];
            }),
        });

        let vdApi = setValidation(state.filterFormats, state.filters);

        const onChange = async (val) => {
            if (!state.showValidation) return;
            await vdApi.fieldValidation(val);
            context.emit('changeValidState', vdApi.isAllValid);
        };

        const onClickReset = () => {
            if (props.loading) return;

            state.collectModeIdx = 0;
            state.showValidation = false;
            state.filters = {};
            vdApi = setValidation(state.filterFormats, state.filters);
            state.crdMenuIdx = 0;
        };

        const getParams = () => {
            const params = {
                // eslint-disable-next-line camelcase
                collector_id: props.collector.collector_id,
                // eslint-disable-next-line camelcase
                collect_mode: state.collectModeMenu[state.collectModeIdx].name,
            };

            if (!_.isEmpty(state.filters)) params.filter = state.filters;

            // eslint-disable-next-line camelcase
            if (state.selectedCrd) params.credential_id = state.selectedCrd.credential_id;
            // eslint-disable-next-line camelcase
            else params.credential_group_id = props.collector.plugin_info.credential_group_id;

            return params;
        };
        const onClickCollectConfirm = async () => {
            if (props.loading) return;
            state.showValidation = true;
            if (await vdApi.allValidation()) {
                CollectorEventBus.$emit('collectData', getParams());
            }
        };

        const onClickCrdMenu = (name, idx) => {
            state.crdMenuIdx = idx;
        };

        const listCredentials = () => {
            if (props.credentials.length > 0) return;

            const params = {};
            if (props.isCredentialType) {
                // eslint-disable-next-line camelcase
                params.credential_id = props.collector.plugin_info.credential_id;
            } else {
                // eslint-disable-next-line camelcase
                params.credential_group_id = props.collector.plugin_info.credential_group_id;
            }
            CollectorEventBus.$emit('listCredentials', params);
        };

        listCredentials();

        return {
            ...toRefs(state),
            vdApi,
            onChange,
            onClickReset,
            onClickCollectConfirm,
            onClickCrdMenu,
        };
    },
};
</script>

<style lang="scss" scoped>
.left-container {
    border-right: 1px solid $gray2;
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
    margin-bottom: .875rem;
    font-size: .875rem;
    font-weight: bold;
    color: $gray1;
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
