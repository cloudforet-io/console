<template>
    <p-button-modal :header-title="tr('COMMON.COL_DATA')"
                    centered
                    size="xl"
                    fade
                    backdrop
                    :footer-cancel-button-bind="{
                        styleType: 'dark',
                        outline: true,
                    }"
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
                        {{ tr('INVENTORY.COL_OPS') }}
                    </p>
                    <p-field-group :label="isCredentialType ? tr('COMMON.CREDENTIAL') : tr('COMMON.CREDENTIAL_GRP')">
                        <div v-if="isCredentialType">
                            <p-text-input :value="crd ? crd.name : ''"
                                          disabled
                            />
                        </div>
                        <div v-else>
                            <!--                            <p-row>-->
                            <!--                                <p-col class="radio-tag" :flex-grow="0">-->
                            <!--                                    <p-radio v-model="crdRadio" value="all" />-->
                            <!--                                    <span>{{ tr('COMMON.ALL') }}</span>-->
                            <!--                                </p-col>-->
                            <!--                                <p-col class="radio-tag">-->
                            <!--                                    <p-radio v-model="crdRadio" value="each" />-->
                            <!--                                    <span>{{ tr('INVENTORY.CHOOSE_CRD') }}</span>-->
                            <!--                                </p-col>-->
                            <!--                            </p-row>-->
                            <p-dropdown-menu-btn :menu="crdsMenu" @clickMenuEvent="onClickCrdMenu">
                                {{ crdsMenu[crdMenuIdx].label }}
                            </p-dropdown-menu-btn>
                        </div>
                    </p-field-group>
                    <p-field-group :label="tr('COMMON.COL_MODE')">
                        <p-dropdown-menu-btn :menu="collectModeMenu">
                            {{ collectModeMenu[collectModeIdx].label }}
                        </p-dropdown-menu-btn>
                    </p-field-group>
                </p-col>
                <p-col class="right-container">
                    <p class="sub-header">
                        {{ tr('INVENTORY.FILTERS') }}
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
                      style-type="primary"
                      outline
                      @click="reset"
            >
                {{ tr('COMMON.BTN_RESET') }}
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
import PRadio from '@/components/molecules/forms/radio/Radio.vue';


export const collectDataState = reactive({
    collectModeIdx: 0,
    collectorModes: ['ALL', 'CREATE', 'UPDATE'],
    filters: {},
    crds: [],
    crdMenuIdx: 0,
    crd: null,
});

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
        PRadio,
    },
    props: {
        collector: Object,
        visible: Boolean,
    },
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
            showValidation: false,
            collectModeMenu: makeTrItems([
                ['ALL', 'COMMON.ALL'],
                ['CREATE', 'COMMON.BTN_CRT'],
                ['UPDATE', 'COMMON.BTN_UPT'],
            ], context.parent, { type: 'item' }),
            image: computed(() => _.get(props.collector, 'tags.icon', config.get('COLLECTOR_IMG'))),
            version: computed(() => _.get(props.collector, 'plugin_info.version', '')),
            description: computed(() => _.get(props.collector, 'tags.description', '')),
            credentialText: '',
            filterFormats: computed(() => _.get(props.collector, 'plugin_info.options.filter_format', [])),
            crdRadio: 'all',
            isCredentialType: computed(() => _.get(props.collector, 'plugin_info.credential_id')),
            crdsMenu: computed(() => [
                { type: 'item', label: context.parent.tr('COMMON.ALL'), name: 'all' },
                ...collectDataState.crds.map(crd => ({ type: 'item', label: crd.name, name: crd.credential_id })),
            ]),
        });

        let vdApi;

        const reset = () => {
            collectDataState.collectModeIdx = 0;
            collectDataState.showValidation = false;
            collectDataState.filters = {};
            vdApi = setValidation(state.filterFormats, collectDataState.filters);
            collectDataState.crdMenuIdx = 0;
        };

        const onChange = async (val) => {
            if (!state.showValidation) return;
            await vdApi.fieldValidation(val);
            context.emit('changeValidState', vdApi.isAllValid.value);
        };

        const onClickCollectConfirm = async () => {
            state.showValidation = true;
            if (await vdApi.allValidation()) CollectorEventBus.$emit('collectData');
        };

        const onClickCrdMenu = (name, idx) => {
            collectDataState.crdMenuIdx = idx;
        };

        if (state.isCredentialType) {
            CollectorEventBus.$emit('getCredential');
        } else {
            CollectorEventBus.$emit('listCredentialsByGroup');
        }

        reset();

        return {
            ...toRefs(collectDataState),
            ...toRefs(state),
            vdApi,
            reset,
            onChange,
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
    .radio-tag {
        margin-right: 1rem;
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
</style>
