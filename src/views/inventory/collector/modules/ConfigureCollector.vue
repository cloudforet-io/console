<template>
    <div>
        <p-row class="all-container">
            <p-col :flex-grow="0" class="container collector-info">
                <p-row>
                    <p-col :flex-grow="0">
                        <img class="img" :src="imgUrl">
                    </p-col>
                    <p-col>
                        <p class="name">
                            {{ plugin ? plugin.name : '' }}
                        </p>
                        <p-field-group label="Version">
                            <p-dropdown-menu-btn :menu="versionsInfo"
                                                 @clickMenuEvent="onSelectVersion"
                            >
                                {{ selectedVersion }}
                            </p-dropdown-menu-btn>
                        </p-field-group>
                        <p-field-group label="Priority">
                            <br>
                            <p-text-input v-model.number="proxyPriority" type="number" />
                        </p-field-group>
                    </p-col>
                </p-row>
            </p-col>

            <p-col class="container options">
                <p class="sub-title">
                    Options
                </p>
                <p-dynamic-form v-for="(op) in pluginOptions" :key="op.key"
                                v-model="proxyOptionsValue[op.key]"
                                :form="op"
                                :invalid="showValidation ? vdApi.invalidState[op.key] : false"
                                :invalid-text="vdApi.invalidMsg[op.key]"
                                @change="onChange(op.key)"
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
        });

        watch(() => props.plugin, (val) => {
            state.vdApi = setValidation(_.get(props.plugin, 'template.options', []), props.optionsValue);
        });

        const onChange = async (key) => {
            if (!props.showValidation || !props.plugin) return;
            await state.vdApi.fieldValidation(key);
            emit('changeValidState', state.vdApi.isAllValid);
        };

        return {
            ...toRefs(state),
            onChange,
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
