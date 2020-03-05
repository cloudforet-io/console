<template>
    <div>
        <p-button class="add-btn" style-type="primary-dark"
                  :disabled="disabled"
                  @click="addPair"
        >
            <p-i name="ic_plus" color="transparent inherit"
                 width="1rem" height="1rem"
            />
            {{ $t('BTN.ADD') }}
        </p-button>
        <span v-for="(d, idx) in pairList" :key="d.id" class="dict-group">
            <p-dict-input :name.sync="d.key" :value.sync="d.value"
                          :key-invalid="enableValidation && d.keyInvalid"
                          :value-invalid="enableValidation && d.valueInvalid"
                          :key-invalid-text="d.keyInvalidText"
                          :value-invalid-text="d.valueInvalidText"
                          :disabled="disabled"
                          @change:key="onChangeKey(idx, d, $event)"
                          @change:value="onChangeValue(idx, d, $event)"
                          @blur:key="onBlurKey(idx, d)"
                          @blur:value="onBlurValue(idx, d)"
                          @focus:key="onFocusKey(idx, d)"
            />
            <p-icon-button name="ic_delete" :disabled="disabled"
                           @click="deletePair(idx, d)"
            />
        </span>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    toRefs, reactive, watch, computed, getCurrentInstance, defineComponent, Ref,
} from '@vue/composition-api';
import {
    InputPair, dictToArray, getProps, DictIGPropsType,
} from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';

const PDictInput = () => import('@/components/molecules/forms/dict-input/DictInput.vue');
const PIconButton = () => import('@/components/molecules/buttons/IconButton.vue');
const PButton = () => import('@/components/atoms/buttons/Button.vue');
const PI = () => import('@/components/atoms/icons/PI.vue');


export default defineComponent({
    name: 'PDictInputGroup',
    components: {
        PIconButton,
        PDictInput,
        PButton,
        PI,
    },
    props: getProps(),
    setup(props: DictIGPropsType) {
        const vm: any = getCurrentInstance();

        const state: any = reactive({
            pairList: dictToArray(props.dict, vm),
            newDict: {},
            isAllValid: computed(() => state.pairList.every(pair => pair.isValid.value)),
        });

        const setNewDict = (pair: InputPair) => { state.newDict[pair.key] = pair.value || null; };

        const emitValidate = () => {
            vm.$emit('validate', state.isAllValid, state.newDict);
        };

        const onChangeKey = (idx: number, pair: InputPair) => {
            if (!props.enableValidation) return;
            pair.validateKey(state.newDict);
        };

        const onChangeValue = (idx: number, pair: InputPair) => {
            if (!props.enableValidation) return;
            pair.validateValue();
        };

        const onFocusKey = (idx: number, pair: InputPair) => {
            if (!props.enableValidation) return;
            if (!pair.keyInvalid) delete state.newDict[pair.key];
        };
        const onBlurKey = (idx: number, pair: InputPair) => {
            if (!props.enableValidation) return;
            if (!pair.keyInvalid) setNewDict(pair);
            emitValidate();
        };
        const onBlurValue = (idx: number, pair: InputPair) => {
            if (!props.enableValidation) return;
            if (pair.isValid.value) setNewDict(pair);
            emitValidate();
        };

        /**
         * @public
         */
        const validateAll = () => {
            state.newDict = {};
            let res = true;
            _.forEach(state.pairList, (pair) => {
                res = pair.validate(state.newDict) && res;
                if (res) setNewDict(pair);
            });
            emitValidate();
            return res;
        };

        const deletePair = (idx: number, pair: InputPair) => {
            state.pairList.splice(idx, 1);
            if (!props.enableValidation) return;

            if (!pair.keyInvalid) {
                delete state.newDict[pair.key];
                state.pairList.some((p) => {
                    if (p.key === pair.key) {
                        if (p.validateKey(state.newDict)) setNewDict(p);
                    }
                    return p.key === pair.key;
                });
            }
            emitValidate();
        };

        const addPair = () => {
            const pair = new InputPair(vm);
            state.pairList.push(pair);
            if (props.enableValidation) pair.validate(state.newDict);
            emitValidate();
        };

        watch(() => props.enableValidation, (val, prevVal) => {
            console.debug('props.enablevalidation', val, prevVal);
            if (val && val !== prevVal) validateAll();
        });

        if (props.showEmptyInput) state.pairList.push(new InputPair(vm));

        return {
            ...toRefs(state),
            onChangeKey,
            onChangeValue,
            onFocusKey,
            onBlurKey,
            onBlurValue,
            deletePair,
            addPair,
            validateAll,
        };
    },
});
</script>

<style lang="scss" scoped>
    .add-btn {
        margin-bottom: .5rem;
        color: $white;
        .p-i-icon {
            margin-right: .5rem;
        }
    }
    .dict-group {
        display: flex;
        margin-bottom: .5rem;
    }
</style>
