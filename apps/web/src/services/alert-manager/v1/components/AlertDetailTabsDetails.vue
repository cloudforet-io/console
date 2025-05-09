<script setup lang="ts">
import { computed, reactive } from 'vue';

import { map } from 'lodash';

import { PDefinitionTable } from '@cloudforet/mirinae';

import { useAlertPageStore } from '@/services/alert-manager/v1/stores/alert-page-store';

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;

const additionalState = reactive({
    fields: computed(() => map(additionalState.data, (d, k) => ({ name: k, label: k })).sort((a, b) => a.label.localeCompare(b.label))),
    data: computed(() => alertPageState.alertData?.additional_info) || {},
});

</script>

<template>
    <section>
        <p-definition-table :fields="additionalState.fields"
                            :data="additionalState.data"
                            :skeleton-rows="7"
                            block
        />
    </section>
</template>
