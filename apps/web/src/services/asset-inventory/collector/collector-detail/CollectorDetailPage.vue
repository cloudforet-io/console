<template>
    <div class="collector-detail-page">
        collector-detail-page - {{ props.collectorId }}
    </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

const props = defineProps({
    collectorId: {
        type: String,
        required: true,
    },
});

</script>
