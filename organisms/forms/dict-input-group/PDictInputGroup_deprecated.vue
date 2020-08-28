<template>
    <div :class="{'p-dict-input-group': true, 'flex flex-wrap': !removeRowEffect }">
        <div v-for="(pair, index) in destructDict"
             :key="index"
             :class="{'dict-input-form': true, 'mr-0': true, 'w-1/2': !useFullCol, 'w-full': useFullCol}"
        >
            <p-icon-button v-if="editMode" class="delete-btn" name="ic_delete"
                           @click="deletePair(index)"
            />
            <span class="data" @mouseleave="mouseInOut(index, false)">
                <p-dict-input :name="pair.name"
                              :value="pair.value"
                              :disabled="!editMode"
                              @mouseenter="mouseInOut(index, true)"
                              @update:name="updatePair(index, 'name', $event)"
                              @update:value="updatePair(index, 'value', $event)"
                />
                <p-copy-button v-if="getActiveState(index) && !editMode" class="copy-btn" :value="pair.value" />
            </span>
        </div>
        <div v-if="editMode" class="w-full" :class="{'dict-input-form': true, 'mr-0': true}">
            <!--<p-icon-button
                class="delete-btn"
                name="ic_delete"
                @click="reset"
            />-->
            <!--<div v-show="validateTag" style="display:block" class="invalid-feedback">
                 * {{ $t('ORGANISMS.TAG_EMPTY') }}
            </div>-->
            <!-- <p-dict-input :name.sync="newPair.name" :value.sync="newPair.value" />-->
            <!-- <p-button class="add-btn" style-type="primary-dark"
                      @click="addPair"
            >
                <p-i name="ic_plus" color="transparent inherit"
                     width="1rem" height="1rem"
                />
                {{ $t('BTN.ADD') }}
            </p-button> -->

            <p-icon-text-button style-type="primary-dark" class="add-btn"
                                name="ic_plus_bold"
                                @click="addPair"
            >
                {{ $t('BTN.ADD') }}
            </p-icon-text-button>
        </div>
    </div>
</template>

<script>
import { transform } from 'lodash';
import {
    toRefs, reactive, ref, watch, computed,
} from '@vue/composition-api';
import PDictInput from '@/components/molecules/forms/dict-input/DictInput_deprecated.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';

const mergeDict = dict => transform(dict, (result, pair) => {
    result[pair.name] = pair.value;
}, {});

const destruct = dict => transform(dict, (result, value, name) => {
    result.push(({ name, value }));
}, []);

const useDictBuffer = (props, context) => {
    const destructDict = ref(destruct(props.dict));
    const state = reactive({
        validatePassWord: false,
    });

    const syncDict = () => {
        context.emit('update:dict', mergeDict(destructDict.value));
        context.emit('change');
    };

    const updatePair = (index, position, value) => {
        destructDict.value[index][position] = value;
        syncDict();
    };

    const deletePair = (index) => {
        destructDict.value.splice(index, 1);
        syncDict();
    };
    const copyText = (event) => {
        const rawText = event.target.parentElement.innerText;
        const copyLength = this.$t('BTN.COPY').length;
        const text = rawText.slice(0, -copyLength).trim();
        this.copyTextToClipboard(text);
    };
    watch(() => props.dict, (dict) => {
        if (dict !== mergeDict(destructDict.value)) {
            destructDict.value = destruct(dict);
        }
    }, { immediate: true });
    return {
        destructDict,
        syncDict,
        updatePair,
        deletePair,
        copyText,
    };
};
const useNewPair = (props, context, dictBuffer) => {
    const newPair = reactive({
        name: '',
        value: '',
    });
    const reset = () => {
        newPair.name = '';
        newPair.value = '';
    };
    const addPair = (idx) => {
        dictBuffer.destructDict.value.push(reactive({ ...newPair }));
        dictBuffer.syncDict();
        reset();
    };

    if (props.showEmptyInput) addPair();

    return {
        newPair,
        addPair,
        reset,
    };
};

const setPairCopy = () => {
    const state = reactive({
        currentIdx: null,
    });

    const mouseInOut = (idx, flag) => {
        if (flag) {
            state.currentIdx = idx;
        } else {
            state.currentIdx = null;
        }
    };

    const getActiveState = idx => state.currentIdx === idx;

    return {
        ...toRefs(state),
        mouseInOut,
        getActiveState,
    };
};

export const setup = (props, context) => {
    const dictBuffer = useDictBuffer(props, context);
    const newPairState = useNewPair(props, context, dictBuffer);
    const pairCopyState = setPairCopy();

    return {
        ...dictBuffer,
        ...newPairState,
        ...pairCopyState,
    };
};

export default {
    name: 'PDictInputGroup',
    components: {
        PDictInput, PIconButton, PCopyButton, PI, PButton, PIconTextButton,
    },
    events: ['update:dict', 'change'],
    props: {
        editMode: {
            type: Boolean,
            default: false,
        },
        useFullCol: {
            type: Boolean,
            default: false,
        },
        dict: {
            type: Object,
        },
        removeRowEffect: {
            type: Boolean,
            default: false,
        },
        showEmptyInput: {
            type: Boolean,
            defulat: false,
        },
    },
    setup(...args) {
        return setup(...args);
    },
};
</script>

<style lang="postcss" scoped>
    p-dict-input-group{
        display: flex;
        flex-wrap:  wrap;
    }
    .p-button{
        flex: none;
    }
    .delete-btn{
        margin-left: 0.5rem;
    }
    .add-btn{
        @apply text-white;
        margin-left: 0.5rem;
    }
    p-dict-input{
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: auto;
    }
    .new-dict-input-form{
        flex-wrap: nowrap;
        white-space: nowrap;
    }
    .dict-input-form{
        display: inline-flex;
        flex-wrap: nowrap;
        white-space: nowrap;
        flex-shrink: 1;
        margin-bottom: 0.5rem;
        &:not(.new-form){
            margin-right: 2.5rem;
        }
    }
    .data{
        display: block;
        width: 100%;
    }
    .copy-btn::v-deep{
        .p-copy-btn{top:-.3rem;
            margin-bottom: 8px;
        }
    }
</style>
