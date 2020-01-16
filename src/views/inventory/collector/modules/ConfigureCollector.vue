<template>
    <div>
        <p-row class="all-container">
            <p-col :flex-grow="0" class="container collector-info">
                <p-row>
                    <p-col :flex-grow="0">
                        <img class="img" :src="plugin.image || defaultImg">
                    </p-col>
                    <p-col>
                        <p class="name">
                            Collector Name
                        </p>
                        <p-field-group label="Version">
                            <p-dropdown-menu-btn :menu="versionsInfo"
                                                 @openMenu="getVersionsInfo"
                                                 @clickMenuEvent="onSelectVersion"
                            >
                                {{ version }}
                            </p-dropdown-menu-btn>
                        </p-field-group>
                        <p-field-group label="Priority">
                            <br>
                            <p-text-input v-model="priority" />
                        </p-field-group>
                    </p-col>
                </p-row>
            </p-col>

            <p-col class="container options">
                <p class="sub-title">
                    Options
                </p>
                <p-dynamic-form v-for="(op, idx) in plugin.template.options" :key="idx"
                                v-model="optionsValue[op.key]"
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
import config from '@/lib/config';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PCol from '@/components/atoms/grid/col/Col.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PDynamicForm, { setValidation } from '@/components/organisms/forms/dynamic-form/DynamicForm.vue';
import { makeProxy } from '@/lib/compostion-util';

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
        plugin: {
            type: Object,
            default: () => ({
                name: '',
                image: '',
                template: {
                    options: [{}],
                    credentials: [],
                },
            }),
        },
        versions: {
            type: Array,
            default: null,
        },
        showValidation: {
            type: Boolean,
            default: false,
        },
        isInvalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            defaultImg: config.get('COLLECTOR_IMG'),
            priority: 10,
            optionsValue: {},
            versionsInfo: computed(() => {
                if (props.versions) {
                    return props.versions.map(v => ({ type: 'item', label: v, name: v }));
                } return [];
            }),
            version: 'Select Version',
            proxyIsInvalid: makeProxy('isInvalid', props, emit),
        });

        const readonlyState = {
            name: props.plugin.name,
        };

        const getVersionsInfo = () => {
            if (state.versionsInfo.length === 0) CollectorEventBus.$emit('listVersionsInfo');
        };
        const onSelectVersion = (item) => {
            state.version = item;
        };

        const vdApi = setValidation(props.plugin.template.options, state.optionsValue);

        watch(() => props.plugin, () => {
            state.optionsValue = {};
            const newVdApi = setValidation(props.plugin.template.options, state.optionsValue);
            vdApi.invalidMsg = newVdApi.invalidMsg;
            vdApi.invalidState = newVdApi.invalidState;
            vdApi.fieldValidation = newVdApi.fieldValidation;
            vdApi.allValidation = newVdApi.allValidation;
            vdApi.isAllValid = newVdApi.isAllValid;
        });

        CollectorEventBus.$emit('getPlugin');

        return {
            ...toRefs(state),
            ...readonlyState,
            getVersionsInfo,
            onSelectVersion,
            vdApi,
            onChange: async (val) => {
                if (!props.showValidation) return;
                await vdApi.fieldValidation(val);
                emit('changeValidState', vdApi.isAllValid.value);
            },
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
