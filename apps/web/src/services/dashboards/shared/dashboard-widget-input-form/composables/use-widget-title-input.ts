import { toRef } from 'vue';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

export const useWidgetTitleInput = () => {
    const {
        forms: { title }, setForm,
        invalidTexts,
        resetAll: resetTitle,
        isAllValid: isTitleValid,
    } = useFormValidator({
        title: '',
    }, {
        title(value: string|undefined) {
            if (value === undefined || !value.trim()) return i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.VALIDATION_NAME');
            return '';
        },
    });
    const updateTitle = (val) => {
        setForm('title', val);
    };
    const titleInvalidText = toRef(invalidTexts, 'title');

    return {
        title,
        resetTitle,
        updateTitle,
        isTitleValid,
        titleInvalidText,
    };
};
