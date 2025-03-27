<script lang="ts" setup>
import { PButton } from '@cloudforet/mirinae';

const emit = defineEmits<{(e: 'add-rule'): void; }>();
interface Props {
    isEditable: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isEditable: false,
});
const handleClickAddEventRule = async () => {
    emit('add-rule');
};
</script>

<template>
    <div class="collector-additional-rule-empty-case">
        <div class="my-4 text-label-xl text-gray-900">
            {{ $t('INVENTORY.COLLECTOR.EMPTY.HEADER') }}
        </div>
        <div class="text-gray-500 text-paragraph-md">
            {{ $t('INVENTORY.COLLECTOR.EMPTY.DESC1') }}
        </div>
        <div class="text-gray-500 text-paragraph-md mb-6">
            {{ $t('INVENTORY.COLLECTOR.EMPTY.DESC2') }}
        </div>
        <p-button icon-left="ic_plus_bold"
                  class="mb-10"
                  :disabled="!props.isEditable"
                  @click="handleClickAddEventRule"
        >
            {{ $t('INVENTORY.COLLECTOR.ADD_ADDITIONAL_RULE') }}
        </p-button>
    </div>
</template>

<style lang="postcss" scoped>
.collector-additional-rule-empty-case {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
}
</style>
