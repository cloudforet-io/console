import { toRef } from 'vue';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { useWidgetFormStore } from '@/services/dashboards/dashboard-customize/stores/widget-form';

export const useWidgetNameInput = () => {
    const widgetFormStore = useWidgetFormStore();
    const {
        forms: { name }, setForm, invalidState, invalidTexts, isAllValid: isNameValid, resetAll: resetName,
    } = useFormValidator({
        name: '',
    }, {
        name(value: string) { return value.trim().length ? '' : i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.VALIDATION_NAME'); },
    });
    const updateName = (val) => {
        setForm('name', val);
        widgetFormStore.setWidgetTitle(val);
    };
    const isNameInvalid = toRef(invalidState, 'name');
    const nameInvalidText = toRef(invalidTexts, 'name');

    return {
        name,
        resetName,
        updateName,
        isNameValid,
        isNameInvalid,
        nameInvalidText,
    };
};
