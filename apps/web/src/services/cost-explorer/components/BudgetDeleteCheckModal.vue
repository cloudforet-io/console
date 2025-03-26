<script setup lang="ts">
import { PButtonModal } from '@cloudforet/mirinae';

interface Props {
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
});
</script>

<template>
    <p-button-modal :visible="props.visible"
                    size="sm"
                    theme-color="alert"
                    hide-body
                    header-title="Do you really want to delete Budget?"
    />
</template>
