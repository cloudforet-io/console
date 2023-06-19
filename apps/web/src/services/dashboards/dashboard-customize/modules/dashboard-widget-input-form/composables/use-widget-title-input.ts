import { toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormValidator } from '@/common/composables/form-validator';

import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';

export const useWidgetTitleInput = () => {
    const { t } = useI18n();
    const widgetFormStore = useWidgetFormStore();
    const {
        forms: { title }, setForm, invalidState, invalidTexts, isAllValid: isTitleValid, resetAll: resetTitle,
    } = useFormValidator({
        title: '',
    }, {
        title(value: string) { return value.trim().length ? '' : t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.VALIDATION_NAME'); },
    });
    const updateTitle = (val) => {
        setForm('title', val);
        widgetFormStore.$patch({ widgetTitle: val });
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
