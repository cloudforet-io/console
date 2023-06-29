<script lang="ts" setup>
import { PFieldGroup, PTextInput } from '@spaceone/design-system';
import {
    reactive, computed, watch, defineExpose,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';

import { useFormValidator } from '@/common/composables/form-validator';

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';



const emits = defineEmits<{(event: 'update:isValid', value: boolean): void;
}>();
const store = useStore();
const { t } = useI18n();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const state = reactive({
    collectors: computed<CollectorReferenceMap>(() => store.getters['reference/collectorItems']),
    collectorNames: computed(() => Object.values(state.collectors).map((item:any) => item.name)),
    isFocused: false,
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
            return t('INVENTORY.COLLECTOR.CREATE.NAME_INVALID_MIN');
        } if (state.collectorNames.includes(value)) {
            return t('INVENTORY.COLLECTOR.CREATE.NAME_INVALID_DUPLICATED');
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

defineExpose({ focus: () => { state.isFocused = true; } });

</script>

<template>
    <p-field-group :label="t('INVENTORY.COLLECTOR.CREATE.NAME')"
                   :invalid-text="invalidTexts.name"
                   :invalid="invalidState.name"
                   :required="true"
    >
        <template #default="{invalid}">
            <p-text-input :value="name"
                          class="block"
                          :invalid="invalid"
                          :is-focused="state.isFocused"
                          @update:value="setForm('name', $event)"
            />
        </template>
    </p-field-group>
</template>
