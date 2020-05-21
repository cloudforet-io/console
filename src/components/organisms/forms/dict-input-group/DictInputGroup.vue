<template>
    <div>
        <slot name="addButton" :disabled="disabled" :addPair="addPair">
            <!-- <p-button class="add-btn" style-type="primary-dark"
                      :disabled="disabled"
                      @click="addPair"
            >
                <p-i name="ic_plus_bold" color="inherit"
                     width="1rem" height="1rem"
                />
                {{ $t('BTN.ADD') }}
            </p-button> -->
            <PIconTextButton style-type="primary-dark"
            class="add-btn" name="ic_plus_bold"
            @click="addPair"
            >
                {{ $t('BTN.ADD') }}
            </PIconTextButton>

        </slot>
        <div v-if="showHeader" class="tag-header">
            <div class="key">
                Key
            </div>
            <div class="value">
                Value
            </div>
        </div>
        <span v-for="(d, idx) in proxyItems" :key="idx" class="dict-group">
            <p-dict-input :name.sync="d.key" :value.sync="d.value"
                          :key-invalid="showValidation && invalidMessages[idx] && !!invalidMessages[idx].key"
                          :value-invalid="showValidation && invalidMessages[idx] && !!invalidMessages[idx].value"
                          :key-invalid-text="invalidMessages[idx] && invalidMessages[idx].key"
                          :value-invalid-text="invalidMessages[idx] && invalidMessages[idx].value"
                          :disabled="disabled"
                          @change:key="onChangeKey(idx, d, $event)"
                          @change:value="onChangeValue(idx, d, $event)"
            />
            <p-icon-button name="ic_delete" :disabled="disabled"
                           @click="deletePair(idx, d)"
            />
        </span>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, watch, getCurrentInstance, defineComponent, Ref,
} from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import {
    dictIGProps, DictIGPropsType,
    DictItem,
} from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';

import { makeProxy } from '@/lib/compostion-util';

const PDictInput = () => import('@/components/molecules/forms/dict-input/DictInput.vue');
const PIconButton = () => import('@/components/molecules/buttons/IconButton.vue');
const PButton = () => import('@/components/atoms/buttons/Button.vue');
const PI = () => import('@/components/atoms/icons/PI.vue');
const PIconTextButton = () => import('@/components/molecules/buttons/IconTextButton.vue');


export default {
    name: 'PDictInputGroup',
    components: {
        PIconButton,
        PDictInput,
        PButton,
        PI,
        PIconTextButton,
    },
    props: dictIGProps,
    setup(props: DictIGPropsType): any {
        const vm: any = getCurrentInstance();

        interface StateType {
            proxyItems: Ref<DictItem[]>;
        }

        const state: UnwrapRef<StateType> = reactive({
            proxyItems: makeProxy('items'),
        });


        const onChangeKey = (idx: number, pair: DictItem) => {
            if (!props.showValidation) return;
            vm.$emit('change', idx, pair);
            vm.$emit('change:key', idx, pair);
        };

        const onChangeValue = (idx: number, pair: DictItem) => {
            if (!props.showValidation) return;
            vm.$emit('change', idx, pair);
            vm.$emit('change:value', idx, pair);
        };

        const deletePair = (idx: number, pair: DictItem) => {
            state.proxyItems.splice(idx, 1);
            if (!props.showValidation) return;
            vm.$emit('change', idx, pair);
            vm.$emit('change:delete', idx, pair);
        };

        const addPair = () => {
            const pair: any = new DictItem();
            state.proxyItems.push(pair);
            vm.$emit('change', state.proxyItems.length - 1, pair);
            vm.$emit('change:add', state.proxyItems.length - 1, pair);
        };

        if (props.showEmptyInput) state.proxyItems.push(new DictItem() as any);

        return {
            ...toRefs(state),
            onChangeKey,
            onChangeValue,
            deletePair,
            addPair,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .add-btn {
        @apply text-white;
        margin-bottom: .5rem;
        .p-i-icon {
            margin-right: .5rem;
        }
    }
    .tag-header{
        @apply py-4;
        .key{
            @apply inline-block font-bold;
            width: 15rem;
        }
        .value{
            @apply inline-block font-bold;
            width: 20rem;
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
