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
        <span v-for="(d, idx) in metaState.pairList" :key="d.syncState.name" class="dict-group">
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
    toRefs, reactive, watch, computed, getCurrentInstance, defineComponent, Ref,
} from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import {
    dictIGProps, DictIGPropsType, DictIGToolSet,
} from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import { DictInputToolSet, toDictInputTSList } from '@/components/molecules/forms/dict-input/DictInput.toolset';

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

        const ts: UnwrapRef<DictIGToolSet> = new DictIGToolSet({ dict: props.dict });

        const emitValidate = () => {
            vm.$emit('validate', ts.metaState.isAllValid, ts.metaState.newDict);
        };

        const onChangeKey = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            pair.validateKey(ts.metaState.newDict);
        };

        const onChangeValue = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            pair.validateValue();
        };

        const onFocusKey = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            if (!pair.state.keyInvalid) delete ts.metaState.newDict[pair.syncState.name];
        };
        const onBlurKey = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            if (!pair.state.keyInvalid) ts.setNewDict(pair);
            emitValidate();
        };
        const onBlurValue = (idx: number, pair: DictInputToolSet) => {
            if (!props.enableValidation) return;
            if (pair.metaState.isValid) ts.setNewDict(pair);
            emitValidate();
        };

        /**
             * @public
             */
        const validateAll = () => {
            const res: boolean = ts.validateAll();
            emitValidate();
            return res;
        };

        const deletePair = (idx: number, pair: DictInputToolSet) => {
            ts.metaState.pairList.splice(idx, 1);
            if (!props.enableValidation) return;

            if (!pair.state.keyInvalid) {
                delete ts.metaState.newDict[pair.syncState.name];
                ts.metaState.pairList.some((p) => {
                    if (p.syncState.name === pair.syncState.name) {
                        if (p.validateKey(ts.metaState.newDict)) ts.setNewDict(p);
                    }
                    return p.syncState.name === pair.syncState.name;
                });
            }
            emitValidate();
        };

        const addPair = () => {
            const pair: DictInputToolSet = new DictInputToolSet();
            ts.metaState.pairList.push(pair);
            if (props.enableValidation) pair.validate(ts.metaState.newDict);
            emitValidate();
        };

        watch(() => props.enableValidation, (val, prevVal) => {
            if (val && val !== prevVal) validateAll();
        });

        if (props.showEmptyInput) ts.metaState.pairList.push(new DictInputToolSet());

        return {
            ...toRefs(ts),
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
