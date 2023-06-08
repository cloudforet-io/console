<template>
    <p-field-group :label="$t('INVENTORY.COLLECTOR.CREATE.NAME')"
                   :invalid-text="invalidTexts.name"
                   :invalid="invalidState.name"
                   :required="true"
    >
        <template #default="{invalid}">
            <p-text-input :value="name"
                          class="block"
                          :invalid="invalid"
                          @update:value="setForm('name', $event)"
            />
        </template>
    </p-field-group>
</template>

<script lang="ts" setup>
import { reactive, computed, watch } from 'vue';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';

import { useFormValidator } from '@/common/composables/form-validator';

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';


const emits = defineEmits<{(event: 'update:isValid', value: boolean): void;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const state = reactive({
    collectors: computed<CollectorReferenceMap>(() => store.getters['reference/collectorItems']),
    collectorNames: computed(() => Object.values(state.collectors).map((item:any) => item.name)),
});

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: collectorFormState.name,
}, {
    name(value: string) {
        if (value.length < 2) {
            return i18n.t('INVENTORY.COLLECTOR.CREATE.NAME_INVALID_MIN');
        } if (state.collectorNames.includes(value)) {
            return i18n.t('INVENTORY.COLLECTOR.CREATE.NAME_INVALID_DUPLICATED');
        }
        return '';
    },
});

watch(name, (value) => {
    collectorFormStore.setName(value);
});

watch(isAllValid, (value) => {
    emits('update:isValid', value);
}, { immediate: true });

(async () => {
    await store.dispatch('reference/collector/load', { force: true });
})();
</script>

