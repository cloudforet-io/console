<template>
    <div>
        <p-row class="all-container">
            <p-col :flex-grow="0" flex-basis="50%" class="container mx-auto collector-info">
                <p-row>
                    <p-col :flex-grow="0">
                        <p-lottie v-if="imgLoading || !plugin"
                                  name="spinner"
                                  auto
                                  :size="2"
                                  class="img"
                        />
                        <img v-show="!imgLoading && plugin" class="img"
                             :src="imgUrl"
                             @load="imgLoading = false"
                        >
                    </p-col>
                    <p-col>
                        <p-field-group :label="$t('INVENTORY.COL_NAME')"
                                       required
                                       :invalid="showValidation && fieldVdApi.invalidState.name"
                                       :invalid-text="$t('INVENTORY.COL_NAME_VD')"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="fieldState.name"
                                              v-focus
                                              style="width: 100%;"
                                              class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm-sm"
                                              :class="{'is-invalid': invalid}"
                                              @input="onChangeFields('name')"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group :label="$t('INVENTORY.VERSION')">
                            <p-dropdown-menu-btn :menu="versionsInfo"
                                                 :loading="versionsInfo ? false : true"
                                                 block
                                                 @clickMenuEvent="onSelectVersion"
                            >
                                {{ selectedVersion }}
                            </p-dropdown-menu-btn>
                        </p-field-group>
                        <p-field-group :label="$t('INVENTORY.PRIORITY')"
                                       :invalid="showValidation && fieldVdApi.invalidState.priority"
                                       :invalid-text="$t('INVENTORY.COL_PRIORITY_VD')"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model.number="fieldState.priority"
                                              type="number"
                                              class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                              :class="{'is-invalid': invalid}"
                                              @input="onChangeFields('priority')"
                                />
                            </template>
                        </p-field-group>
                    </p-col>
                </p-row>
            </p-col>
<!--            <p-col v-if="pluginOptions.length > 0" class="container mx-auto options">-->
            <p-col v-if="pluginOptions.length > 0" class="container options">
                <p class="sub-title">
                    {{ $t('INVENTORY.OPTIONS') }}
                </p>
                <p-dynamic-form v-for="(op) in pluginOptions" :key="op.key"
                                v-model="proxyOptionsValue[op.key]"
                                :form="op"
                                :invalid="showValidation ? vdApi.invalidState[op.key] : false"
                                :invalid-text="vdApi.invalidMsg[op.key]"
                                @change="onChangeOption(op.key)"
                />
            </p-col>
        </p-row>
    </div>
</template>

<script>
import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import config from '@/lib/config';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import {
    formValidation, makeProxy, requiredValidation, Validation,
} from '@/lib/compostion-util';

import PCol from '@/components/atoms/grid/col/Col.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PDynamicForm, { setValidation } from '@/components/organisms/forms/dynamic-form/DynamicForm.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

const init = (props, root) => {
    const params = {
        // eslint-disable-next-line camelcase
        plugin_id: props.pluginId,
    };
    CollectorEventBus.$emit('getPlugin', params);
    CollectorEventBus.$emit('listVersionsInfo', params);
};

export default {
    name: 'ConfigureCollector',
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    components: {
        PLottie,
        PCol,
        PRow,
        PFieldGroup,
        PDropdownMenuBtn,
        PTextInput,
        PDynamicForm,
    },
    props: {
        showValidation: {
            type: Boolean,
            default: false,
        },
        pluginId: String,
        plugin: Object,
        versions: Array,
        loading: Boolean,
        /**
         * sync prop
         */
        name: String,
        /**
         * sync prop
         */
        selectedVersion: String,
        /**
         * sync prop
         */
        optionsValue: Object,
        /**
         * sync prop
         */
        priority: Number,
    },
    setup(props, { emit, root }) {
        init(props, root);

        const fieldState = reactive({
            name: props.name,
            priority: props.priority,
        });

        const fieldValidation = {
            name: [requiredValidation()],
            priority: [new Validation(p => p > 0 && p <= 1000)],
        };

        const state = reactive({
            pluginOptions: computed(() => _.get(props.plugin, 'template.options', [])),
            proxyOptionsValue: makeProxy('optionsValue', props, emit),
            proxySelectedVersion: makeProxy('selectedVersion', props, emit),
            imgUrl: computed(() => _.get(props.plugin, 'tags.icon', config.get('COLLECTOR_IMG'))),
            versionsInfo: computed(() => {
                if (!props.selectedVersion) state.proxySelectedVersion = props.versions[0];
                return props.versions.map(v => ({ type: 'item', label: v, name: v }));
            }),
            onSelectVersion: (item) => {
                state.proxySelectedVersion = item;
            },
            vdApi: setValidation(_.get(props.plugin, 'template.options', []), props.optionsValue),
            fieldState,
            fieldVdApi: formValidation(fieldState, fieldValidation),
            imgLoading: true,
        });

        const actions = {
            validate: async () => {
                const options = await state.vdApi.allValidation();
                const fields = await state.fieldVdApi.allValidation();
                return options && fields;
            },
            onChangeFields: async (key) => {
                emit(`update:${key}`, fieldState[key]);
                if (!props.showValidation) return;
                await state.fieldVdApi.fieldValidation(key);
                emit('changeValidState', state.fieldVdApi.isAllValid);
            },
            onChangeOption: async (key) => {
                if (!props.showValidation) return;
                await state.vdApi.fieldValidation(key);
                emit('changeValidState', state.vdApi.isAllValid);
            },
        };

        watch(() => props.plugin, (val) => {
            state.vdApi = setValidation(_.get(props.plugin, 'template.options', []), props.optionsValue);
        });

        return {
            ...toRefs(state),
            ...actions,
        };
    },
};
</script>

<style lang="scss" scoped>
.all-container {
    padding: 2.4rem 0;
    .container {
        padding: 0 2.5rem;
        margin: unset;
        width: unset;
    }
    .collector-info {
        border-right: 1px solid $gray2;
        .img {
            height: 5.5rem;
            width: 5.5rem;
            margin-right: 2rem;
        }
        .name {
            font-size: 1.125rem;
            padding-bottom: 1rem;
        }
    }
    .sub-title {
        color: $gray1;
        font-weight: bold;
        font-size: .875rem;
        line-height: 1rem;
        padding-bottom: 1rem;
    }
}
</style>
