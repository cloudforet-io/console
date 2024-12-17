import type { Ref } from 'vue';
import { reactive, toRef, computed } from 'vue';

import { defineStore } from 'pinia';

import { APIError } from '@cloudforet/core-lib/space-connector/error';

import { i18n, type SupportLanguage } from '@/translations';

import { useSharedConfigStore } from '@/store/domain/shared-config-store';

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
    task: string;
    tasks: string;
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
    const sharedConfigStore = useSharedConfigStore();
    const sharedConfigStoreGetters = sharedConfigStore.getters;

    const templateData = toRef(sharedConfigStoreGetters, 'TASK_TEMPLATE') as unknown as Ref<TemplateData|undefined>;
    const landingData = toRef(sharedConfigStoreGetters, 'TASK_LANDING') as unknown as Ref<LandingData|undefined>;

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
            const res = await sharedConfigStore.get<TemplateData>('TASK_TEMPLATE');
            state.templateId = res.data.template_id ?? 'default';
        } catch (e) {
            if (e instanceof APIError && e.status === 404) return;
            ErrorHandler.handleError(e);
        }
    };
    const updateTemplateId = async (templateId: TaskManagementTemplateType) => {
        const prev = state.templateId;
        state.templateId = templateId;
        try {
            await sharedConfigStore.set<TemplateData>('TASK_TEMPLATE', { template_id: templateId });
        } catch (e) {
            ErrorHandler.handleError(e);
            state.templateId = prev;
        }
    };
    const setInitialLandingData = async () => {
        if (landingData.value?.enabled) {
            state.enableLanding = landingData.value.enabled;
            return;
        }
        try {
            const res = await sharedConfigStore.get<LandingData>('TASK_LANDING');
            state.enableLanding = res.data.enabled ?? false;
        } catch (e) {
            if (e instanceof APIError && e.status === 404) return;
            ErrorHandler.handleError(e);
        }
    };

    const updateLandingData = async (enabled: boolean) => {
        const prev = state.enableLanding;
        state.enableLanding = enabled;
        try {
            await sharedConfigStore.set<LandingData>('TASK_LANDING', { enabled });
        } catch (e) {
            ErrorHandler.handleError(e);
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
