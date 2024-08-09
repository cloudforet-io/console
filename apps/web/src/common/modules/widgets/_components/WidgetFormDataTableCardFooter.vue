<script setup lang="ts">
import { PButton } from '@cloudforet/mirinae';

interface Props {
   disabled: boolean;
   changed: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'delete'): void;
    (e: 'reset'): void;
    (e: 'update'): void;
}>();

const handleClickDeleteDataTable = () => {
    emit('delete');
};
const handleClickResetDataTable = () => {
    emit('reset');
};
const handleUpdateDataTable = () => {
    emit('update');
};
</script>


<template>
    <div class="widget-form-data-table-card-footer">
        <p-button style-type="tertiary"
                  icon-left="ic_delete"
                  @click="handleClickDeleteDataTable"
        >
            {{ $t('COMMON.WIDGETS.DELETE') }}
        </p-button>
        <div class="form-button-wrapper">
            <p-button style-type="transparent"
                      icon-left="ic_refresh"
                      @click="handleClickResetDataTable"
            >
                {{ $t('COMMON.WIDGETS.RESET') }}
            </p-button>
            <p-button style-type="secondary"
                      class="apply-button"
                      :disabled="props.disabled"
                      @click="handleUpdateDataTable"
            >
                {{ $t('COMMON.WIDGETS.APPLY') }}
                <div v-if="props.changed"
                     class="update-dot"
                />
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-footer {
    @apply border-t border-gray-200 flex justify-between;
    padding: 0.75rem 1rem;

    .apply-button {
        @apply relative;
        .update-dot {
            @apply absolute rounded-full bg-blue-500 border-2 border-white;
            width: 0.75rem;
            height: 0.75rem;
            right: -0.375rem;
            top: -0.375rem;
        }
    }
    .form-button-wrapper {
        @apply flex gap-2;
    }
}
</style>
