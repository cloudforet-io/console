import { toRef } from 'vue';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

export const useWidgetTitleInput = () => {
    const {
        forms: { title }, setForm, invalidState, invalidTexts, resetAll: resetTitle,
    } = useFormValidator({
        title: '',
    }, {
        title(value: string|undefined) { return value?.trim().length ? '' : i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.VALIDATION_NAME'); },
    });
    const updateTitle = (val) => {
        setForm('title', val);
    };
    const isTitleInvalid = toRef(invalidState, 'title');
    const titleInvalidText = toRef(invalidTexts, 'title');

    return {
        title,
        resetTitle,
        updateTitle,
        isTitleInvalid,
        titleInvalidText,
    };
};
