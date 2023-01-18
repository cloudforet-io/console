import { toRef } from 'vue';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { useWidgetFormStore } from '@/services/dashboards/dashboard-customize/stores/widget-form';

export const useWidgetTitleInput = () => {
    const widgetFormStore = useWidgetFormStore();
    const widgetFormState = widgetFormStore.state;
    const {
        forms: { title }, setForm, invalidState, invalidTexts, isAllValid: isTitleValid, resetAll: resetTitle,
    } = useFormValidator({
        title: '',
    }, {
        title(value: string) { return value.trim().length ? '' : i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.VALIDATION_NAME'); },
    });
    const updateTitle = (val) => {
        setForm('title', val);
        widgetFormState.widgetTitle = val;
    };
    const isTitleInvalid = toRef(invalidState, 'title');
    const titleInvalidText = toRef(invalidTexts, 'title');

    return {
        title,
        resetTitle,
        updateTitle,
        isTitleValid,
        isTitleInvalid,
        titleInvalidText,
    };
};
