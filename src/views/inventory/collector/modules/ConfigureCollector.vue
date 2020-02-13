<template>
    <div>
        <p-row class="all-container">
            <p-col :flex-grow="0" flex-basis="50%" class="container collector-info">
                <p-row>
                    <p-col :flex-grow="0">
                        <img class="img" :src="imgUrl">
                    </p-col>
                    <p-col>
                        <p-field-group label="Collector Name"
                                       required
                        >
                            <!--                            :invalid="showValidation && nameInvalidState"-->
                            <!--                            :invalid-text="nameInvalidMsg"-->
                            <template #default="{invalid}">
                                <p-text-input v-model="proxyName"
                                              style="width: 100%;"
                                              class="form-control"
                                              :class="{'is-invalid': invalid}"
                                              @input="onChangeName"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group label="Version">
                            <p-dropdown-menu-btn :menu="versionsInfo"
                                                 :loading="versionsInfo ? false : true"
                                                 block
                                                 @clickMenuEvent="onSelectVersion"
                            >
                                {{ selectedVersion }}
                            </p-dropdown-menu-btn>
                        </p-field-group>
                        <p-field-group label="Priority">
                            <br>
                            <p-text-input v-model.number="proxyPriority"
                                          type="number"
                                          style="width: 100%;"
                            />
                        </p-field-group>
                    </p-col>
                </p-row>
            </p-col>

            <p-col v-if="pluginOptions.length > 0" class="container options">
                <p class="sub-title">
                    Options
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

import PCol from '@/components/atoms/grid/col/Col.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PDynamicForm, { setValidation } from '@/components/organisms/forms/dynamic-form/DynamicForm.vue';
import { makeProxy } from '@/lib/compostion-util';

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
    components: {
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

        const state = reactive({
            proxyName: makeProxy('name', props, emit),
            namePlaceholder: computed(() => _.get(props.plugin, 'name', '')),
            pluginOptions: computed(() => _.get(props.plugin, 'template.options', [])),
            proxyOptionsValue: makeProxy('optionsValue', props, emit),
            proxySelectedVersion: makeProxy('selectedVersion', props, emit),
            proxyPriority: makeProxy('priority', props, emit),
            imgUrl: computed(() => _.get(props.plugin, 'tags.icon', config.get('COLLECTOR_IMG'))),
            versionsInfo: computed(() => {
                if (!props.selectedVersion) state.proxySelectedVersion = props.versions[0];
                return props.versions.map(v => ({ type: 'item', label: v, name: v }));
            }),
            onSelectVersion: (item) => {
                state.proxySelectedVersion = item;
            },
            vdApi: setValidation(_.get(props.plugin, 'template.options', []), props.optionsValue),
            isAllValid: undefined,
            validate: async () => {
                const res = await state.vdApi.allValidation();
                return res && props.name;
            },
            onChangeName: (val) => {
                if (!props.showValidation) return;
                emit('changeValidState', !!val);
            },
            onChangeOption: async (key) => {
                if (!props.showValidation || !props.plugin) return;
                await state.vdApi.fieldValidation(key);
                emit('changeValidState', state.vdApi.isAllValid && props.name);
            },
        });

        watch(() => props.plugin, (val) => {
            state.vdApi = setValidation(_.get(props.plugin, 'template.options', []), props.optionsValue);
        });
        watch(() => props.name, (val) => {
            state.vdApi = setValidation(_.get(props.plugin, 'template.options', []), props.optionsValue);
        });


        return {
            ...toRefs(state),
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
