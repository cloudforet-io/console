<template>
    <div class="generate-id-format">
        <p-button style-type="gray-border" :outline="true"
                  class="generate-button"
                  @click="handleClickGenerate"
        >
            {{ $t('COMPONENT.JSON_SCHEMA_FORM.GENERATE') }}
        </p-button>
        <div class="generate-id-wrapper">
            <p-copy-button auto-hide-icon>
                {{ value || '' }}
            </p-copy-button>
            <p-icon-button v-if="value" name="ic_trashcan"
                           class="delete-button"
                           @click="handleClickDelete"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import { v4 as uuidV4 } from 'uuid';

import PButton from '@/inputs/buttons/button/PButton.vue';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

interface Props {
    value?: string
}

export default defineComponent<Props>({
    name: 'GenerateIdFormat',
    components: {
        PIconButton,
        PCopyButton,
        PButton,
    },
    props: {
        value: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyValue: computed<string|undefined>(() => props.value),
        });

        const handleClickGenerate = () => {
            emit('update:value', uuidV4());
        };

        const handleClickDelete = () => {
            emit('update:value', '');
        };


        return {
            ...toRefs(state),
            handleClickGenerate,
            handleClickDelete,
        };
    },
});
</script>

<style lang="postcss">
.generate-id-format {
    display: flex;
    align-items: center;
    max-width: 100%;
    overflow: hidden;
    > .generate-button {
        margin-right: 0.5rem;
        flex-shrink: 0;
    }
    > .generate-id-wrapper {
        @apply bg-gray-100 rounded;
        display: flex;
        align-items: center;
        overflow: hidden;
        > .p-copy-button {
            display: flex;
            align-items: center;
            overflow: hidden;
            margin: 0 1.25rem;
            > .copy-text {
                @apply truncate;
            }
            > .copy-icon {
                flex-shrink: 0;
            }
        }
        > .delete-button {
            flex-shrink: 0;
        }
    }
}
</style>
