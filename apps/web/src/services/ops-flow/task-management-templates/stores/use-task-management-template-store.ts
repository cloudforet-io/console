import type { Ref } from 'vue';
import { reactive, toRef, computed } from 'vue';

import { defineStore } from 'pinia';

import { APIError } from '@cloudforet/core-lib/space-connector/error';

import { i18n, type SupportLanguage } from '@/translations';


import { usePublicConfigStore } from '@/store/config/public-config-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    TaskManagementTemplateType,
} from '@/services/ops-flow/task-management-templates/types/task-management-template-type';

import en from '../translations/en.json';
import ja from '../translations/ja.json';
import ko from '../translations/ko.json';

interface TaskManagementTemplate {
    TemplateName: string;
    Task: string;
    TaskType: string;
    TaskBoard: string;
    TaskCategory: string;
    taskTypes: string;
    taskType: string;
    task: string;
    tasks: string;
    landingDescription?: string;
}
const messages: Record<SupportLanguage, TaskManagementTemplate> = {
    en: en as unknown as TaskManagementTemplate,
    ja: ja as unknown as TaskManagementTemplate,
    ko: ko as unknown as TaskManagementTemplate,
};

interface TemplateData {
    template_id: TaskManagementTemplateType;
}
interface LandingData {
    enabled: boolean;
}
interface UseTaskManagementTemplateStoreState {
    templateId: TaskManagementTemplateType;
    enableLanding: boolean;
}
export const useTaskManagementTemplateStore = defineStore('task-management-template', () => {
    const publicConfigStore = usePublicConfigStore();
    const publicConfigStoreGetters = publicConfigStore.getters;

    const templateData = toRef(publicConfigStoreGetters, 'TASK_TEMPLATE') as unknown as Ref<TemplateData|undefined>;
    const landingData = toRef(publicConfigStoreGetters, 'TASK_LANDING') as unknown as Ref<LandingData|undefined>;

    const state = reactive<UseTaskManagementTemplateStoreState>({
        templateId: 'default',
        enableLanding: true,
    });

    const translate = (code: keyof TaskManagementTemplate, type?: TaskManagementTemplateType) => computed(() => {
        const lang = i18n.locale as SupportLanguage;
        const _type = type ?? state.templateId;
        const msg = messages[lang][_type][code] || messages.en[_type][code];
        return msg;
    });
    const templates = computed<TaskManagementTemplate>(() => {
        const lang = i18n.locale as SupportLanguage;
        const type = state.templateId;
        return messages[lang][type] || messages.en[type];
    });
    const setInitialTemplateId = async () => {
        if (templateData.value?.template_id) {
            state.templateId = templateData.value.template_id;
            return;
        }
        try {
            const res = await publicConfigStore.get<TemplateData>('TASK_TEMPLATE');
            state.templateId = res?.data?.template_id ?? 'default';
        } catch (e) {
            if (e instanceof APIError && e.status === 404) {
                state.templateId = 'default';
                console.warn('404 Not Found: Template Id Data not found.');
                return;
            }
            ErrorHandler.handleError(e);
        }
    };
    const updateTemplateId = async (templateId: TaskManagementTemplateType) => {
        const prev = state.templateId;
        state.templateId = templateId;
        try {
            await publicConfigStore.set<TemplateData>('TASK_TEMPLATE', { template_id: templateId });
            showSuccessMessage(i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: i18n.t('OPSFLOW.TASK_MANAGEMENT.TEMPLATE_TYPE') }), '');
        } catch (e) {
            ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: i18n.t('OPSFLOW.TASK_MANAGEMENT.TEMPLATE_TYPE') }));
            state.templateId = prev;
        }
    };
    const setInitialLandingData = async () => {
        if (landingData.value?.enabled) {
            state.enableLanding = landingData.value.enabled;
            return;
        }
        try {
            const res = await publicConfigStore.get<LandingData>('TASK_LANDING');
            state.enableLanding = res?.data?.enabled ?? false;
        } catch (e) {
            if (e instanceof APIError && e.status === 404) {
                state.enableLanding = false;
                console.warn('404 Not Found: Template Landing Data not found.');
                return;
            }
            ErrorHandler.handleError(e);
        }
    };

    const updateLandingData = async (enabled: boolean) => {
        const prev = state.enableLanding;
        state.enableLanding = enabled;
        try {
            await publicConfigStore.set<LandingData>('TASK_LANDING', { enabled });
            showSuccessMessage(
                enabled
                    ? i18n.t('OPSFLOW.TASK_MANAGEMENT.ALT_S_ENABLE_LANDING')
                    : i18n.t('OPSFLOW.TASK_MANAGEMENT.ALT_S_DISABLE_LANDING'),
                '',
            );
        } catch (e) {
            ErrorHandler.handleRequestError(e, enabled
                ? i18n.t('OPSFLOW.TASK_MANAGEMENT.ALT_E_ENABLE_LANDING')
                : i18n.t('OPSFLOW.TASK_MANAGEMENT.ALT_E_DISABLE_LANDING'));
            state.enableLanding = prev;
        }
    };
    return {
        state,
        translate,
        templates,
        setInitialTemplateId,
        setInitialLandingData,
        updateTemplateId,
        updateLandingData,
    };
});
