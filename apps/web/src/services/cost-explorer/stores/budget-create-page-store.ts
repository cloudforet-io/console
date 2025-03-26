import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { BudgetNotificationRecipients } from '@/api-clients/cost-analysis/budget/schema/type';

import type { Currency } from '@/store/display/type';

interface BudgetCreatePageState {
    loading: boolean;
    currentStep: number;
    name: string;
    project: string;
    scope: {
        type: number;
        serviceAccount: string|undefined;
    };
    selectedBudgetManagerList: string[];
    recipients: BudgetNotificationRecipients;
    currency: Currency | undefined;
    time_unit: 'fixedTerm' | 'monthly';
    startMonth: string,
    endMonth: string,
    temp: string;
    limit: number;
    planned_limits: {
        date: string;
        limit: number;
    }[] | undefined;
}

export const useBudgetCreatePageStore = defineStore('page-budget-create', () => {
    const state = reactive<BudgetCreatePageState>({
        loading: false,
        currentStep: 1,
        name: '',
        project: '',
        scope: {
            type: 0,
            serviceAccount: '',
        },
        selectedBudgetManagerList: [],
        recipients: {
            role_types: [],
            users: [],
            service_account_manager: '',
        },
        currency: undefined,
        time_unit: 'fixedTerm',
        startMonth: '',
        endMonth: '',
        temp: '',
        limit: 0,
        planned_limits: [],
    });
    const setName = (name: string) => {
        state.name = name;
    };
    const setCurrentStep = (step: number) => {
        state.currentStep = step;
    };
    const setProject = (projectId: string) => {
        state.project = projectId;
    };
    const setScope = (value: any) => {
        state.scope = value;
    };
    const setCurrency = (currency: any) => {
        state.currency = currency;
    };
    const setStart = (startMonth: string) => {
        state.startMonth = startMonth;
    };
    const setEnd = (endMonth: string) => {
        state.endMonth = endMonth;
    };
    const setTimeUnit = (time_unit) => {
        state.time_unit = time_unit;
    };
    const setPlannedLimits = (planned_limit) => {
        state.planned_limits = planned_limit;
    };
    const setTemp = (t) => { state.temp = t; };
    const setLimit = (limit: number) => { state.limit = limit; };
    const mutations = {
        setName,
        setCurrentStep,
        setProject,
        setScope,
        setCurrency,
        setStart,
        setEnd,
        setTimeUnit,
        setTemp,
        setLimit,
        setPlannedLimits,
    };

    const reset = () => {
        state.name = '';
        state.currentStep = 1;
        state.project = '';
        // state.scope = {
        //     type: '',
        //     serviceAccount: '',
        // },
        // recipients = {
        //     role_types: [],
        //     users: [],
        // };
    };

    const getters = reactive({ });



    return {
        state,
        getters,
        ...mutations,
        reset,
    };
});
