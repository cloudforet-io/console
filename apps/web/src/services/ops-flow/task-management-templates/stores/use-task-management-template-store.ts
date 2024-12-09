import type { Ref } from 'vue';
import { reactive, toRef, computed } from 'vue';

import { defineStore } from 'pinia';

import { APIError } from '@cloudforet/core-lib/space-connector/error';

import { i18n, type SupportLanguage } from '@/translations';

import { useDomainConfigStore } from '@/store/domain/domain-config-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    TaskManagementTemplateType,
} from '@/services/ops-flow/task-management-templates/types/task-management-template-type';

import en from '../translations/en.json';
import ja from '../translations/ja.json';
import ko from '../translations/ko.json';


interface TaskManagementTemplate {
    templateName: string;
    taskCategory: string;
    allTaskCategories: string;
    taskType: string;
    createTaskType: string;
    editTaskType: string;
    createTask: string;
    taskProgress: string;
    landingTitle?: string;
    landingDescription?: string;
    activeTasks?: string;
    viewAllTasks?: string;
    noActiveTasks?: string;
}
const messages: Record<SupportLanguage, TaskManagementTemplate> = {
    en: en as unknown as TaskManagementTemplate,
    ja: ja as unknown as TaskManagementTemplate,
    ko: ko as unknown as TaskManagementTemplate,
};

interface DomainConfigTemplateData {
    template_id: TaskManagementTemplateType;
}

interface UseTaskManagementTemplateStoreState {
    templateId: TaskManagementTemplateType
}
export const useTaskManagementTemplateStore = defineStore('task-management-template', () => {
    const domainConfigStore = useDomainConfigStore();
    const domainConfigStoreGetters = domainConfigStore.getters;

    const templateData = toRef(domainConfigStoreGetters, 'TASK_TEMPLATE') as unknown as Ref<DomainConfigTemplateData|undefined>;

    const state = reactive<UseTaskManagementTemplateStoreState>({
        templateId: 'default',
    });

    const translate = (code: keyof TaskManagementTemplate, type?: TaskManagementTemplateType) => computed(() => {
        const lang = i18n.locale as SupportLanguage;
        const _type = type ?? state.templateId;
        const msg = messages[lang][_type][code] || messages.en[_type][code];
        console.debug('translate', lang, _type, code, 'msg', msg, typeof msg);
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
            const res = await domainConfigStore.get<DomainConfigTemplateData>('TASK_TEMPLATE');
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
            await domainConfigStore.set<DomainConfigTemplateData>('TASK_TEMPLATE', { template_id: templateId });
        } catch (e) {
            ErrorHandler.handleError(e);
            state.templateId = prev;
        }
    };

    setInitialTemplateId();
    return {
        state,
        translate,
        templates,
        setInitialTemplateId,
        updateTemplateId,
    };
});
