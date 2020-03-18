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
            <p-dict-input v-bind.sync="d.syncState"
                          :key-invalid="enableValidation && d.state.keyInvalid"
                          :value-invalid="enableValidation && d.state.valueInvalid"
                          :key-invalid-text="d.state.keyInvalidText"
                          :value-invalid-text="d.state.valueInvalidText"
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
    toRefs, reactive, watch, getCurrentInstance, defineComponent, Ref,
} from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import {
    dictIGProps, DictIGPropsType,
} from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import {
    DictInputToolSet, toDictInputTSList, DictInputListState, DictInputListStateType,
} from '@/components/molecules/forms/dict-input/DictInput.toolset';

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
    props: dictIGProps,
    setup(props: DictIGPropsType): any {
        const vm: any = getCurrentInstance();

        const state: UnwrapRef<DictInputListStateType> = props.listState
            ? props.listState.state : reactive({
                pairList: toDictInputTSList(props.dict),
                newDict: {},
                isAllValid: false,
            });

        const setNewDict = (pair: DictInputToolSet) => {
            state.newDict[pair.syncState.name] = pair.syncState.value || null;
        };

        const emitValidate = () => {
            vm.$emit('validate', state.isAllValid, state.newDict);
        };

        const onChangeKey = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            pair.validateKey(state.newDict);
        };

        const onChangeValue = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            pair.validateValue();
        };

        const onFocusKey = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            if (!pair.state.keyInvalid) delete state.newDict[pair.syncState.name];
        };
        const onBlurKey = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            if (!pair.state.keyInvalid) setNewDict(pair);
            emitValidate();
        };
        const onBlurValue = (idx: number, pair: DictInputToolSet) => {
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
            state.pairList.forEach((pair: any) => {
                res = pair.validate(state.newDict) && res;
                if (res) setNewDict(pair);
            });
            emitValidate();
            return res;
        };

        const deletePair = (idx: number, pair: DictInputToolSet) => {
            state.pairList.splice(idx, 1);
            if (!props.enableValidation) return;

            if (!pair.state.keyInvalid) {
                delete state.newDict[pair.syncState.name];
                state.pairList.some((p: any) => {
                    if (p.syncState.name === pair.syncState.name) {
                        if (p.validateKey(state.newDict)) setNewDict(p);
                    }
                    return p.syncState.name === pair.syncState.name;
                });
            }
            emitValidate();
        };

        const addPair = () => {
            const pair: any = new DictInputToolSet();
            state.pairList.push(pair);
            if (props.enableValidation) pair.validate(state.newDict);
            emitValidate();
        };

        watch(() => props.enableValidation, (val, prevVal) => {
            if (val && val !== prevVal) validateAll();
        });

        if (props.showEmptyInput) state.pairList.push(new DictInputToolSet() as any);

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

<style lang="postcss" scoped>
    .add-btn {
        @apply text-white;
        margin-bottom: .5rem;
        .p-i-icon {
            margin-right: .5rem;
        }
    }
    .dict-group {
        display: flex;
        margin-bottom: .5rem;
        .p-dict-input {
            margin-right: .5rem;
        }
    }
</style>
