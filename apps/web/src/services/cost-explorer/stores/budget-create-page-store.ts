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
        type: string;
        serviceAccount: string|undefined;
    };
    selectedBudgetManagerList: string[];
    recipients: BudgetNotificationRecipients;
    currency: Currency;
    time_unit: 'TOTAL' | 'MONTHLY' | '';
    startMonth: string[];
    endMonth: string[];
    alreadyExistingBudgetYear: string[];
    budgetYear: string;
    temp: string;
    limit: number|undefined;
    planned_limits: {
        date: string;
        limit: number;
    }[] | undefined;
    state: 'ENABLED' | 'DISABLED';
    thresholds: {
        value: number|undefined;
    }[];
    budgetManager: string;
    selectedMonthlyBudgetAllocation: string|undefined;
    budgetAppliedSameAmount: number|undefined;
    initialAmount: number|undefined,
    monthlyGrowthRate: number|undefined,
    analyzedCostData: number|undefined,
    budgetEachDate: any;
}

export const useBudgetCreatePageStore = defineStore('page-budget-create', () => {
    const state = reactive<BudgetCreatePageState>({
        loading: false,
        currentStep: 1,
        name: '',
        project: '',
        scope: {
            type: 'project',
            serviceAccount: '',
        },
        selectedBudgetManagerList: [],
        recipients: {
            users: [],
        },
        currency: 'KRW',
        time_unit: '',
        startMonth: [],
        endMonth: [],
        alreadyExistingBudgetYear: [],
        budgetYear: '',
        temp: '',
        limit: undefined,
        planned_limits: [],
        state: 'ENABLED',
        thresholds: [
            {
                value: undefined,
            },
        ],
        budgetManager: '',
        selectedMonthlyBudgetAllocation: undefined,
        budgetAppliedSameAmount: undefined,
        initialAmount: undefined,
        monthlyGrowthRate: undefined,
        analyzedCostData: undefined,
        budgetEachDate: [],
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
    const setStart = (startMonth: []) => {
        state.startMonth = startMonth;
    };
    const setEnd = (endMonth: []) => {
        state.endMonth = endMonth;
    };
    const setExistingBudgetYear = (years: string[]) => {
        state.alreadyExistingBudgetYear = years;
    };
    const setBudgetYear = (year: string) => {
        state.budgetYear = year;
    };
    const setTimeUnit = (time_unit) => {
        state.time_unit = time_unit;
    };
    const setPlannedLimits = (planned_limit) => {
        state.planned_limits = planned_limit;
    };
    const setTemp = (t) => { state.temp = t; };
    const setLimit = (limit: number) => { state.limit = limit; };
    const setThresholds = (thresholds: { value: number }) => {
        state.thresholds.push(thresholds);
    };
    const setRecipients = (recipients: string[]) => {
        state.recipients.users = recipients;
    };
    const setBudgetManager = (user_id: string) => {
        state.budgetManager = user_id;
    };
    const setSelectedMonthlyBudgetAllocation = (value: string | undefined) => {
        state.selectedMonthlyBudgetAllocation = value;
    };
    const setBudgetEachDate = (index: number, value: string) => {
        state.budgetEachDate[index] = value;
    };
    const setBudgetAppliedSameAmount = (value: number | undefined) => {
        state.budgetAppliedSameAmount = value;
    };
    const setInitialAmount = (value: number | undefined) => {
        state.initialAmount = value;
    };
    const setMonthlyGrowthRate = (value: number | undefined) => {
        state.monthlyGrowthRate = value;
    };
    const mutations = {
        setName,
        setCurrentStep,
        setProject,
        setScope,
        setCurrency,
        setStart,
        setEnd,
        setExistingBudgetYear,
        setBudgetYear,
        setTimeUnit,
        setTemp,
        setLimit,
        setPlannedLimits,
        setThresholds,
        setRecipients,
        setBudgetManager,
        setSelectedMonthlyBudgetAllocation,
        setBudgetEachDate,
        setBudgetAppliedSameAmount,
        setInitialAmount,
        setMonthlyGrowthRate,
    };

    const reset = () => {
        state.loading = false;
        state.name = '';
        state.currentStep = 1;
        state.project = '';
        state.scope = {
            type: 'project',
            serviceAccount: '',
        };
        state.selectedBudgetManagerList = [];
        state.recipients = {
            users: [],
        };
        state.currency = 'KRW';
        state.time_unit = '';
        state.startMonth = [];
        state.endMonth = [];
        state.alreadyExistingBudgetYear = [];
        state.budgetYear = '';
        state.temp = '';
        state.limit = undefined;
        state.planned_limits = [];
        state.state = 'ENABLED';
        state.thresholds = [
            {
                value: undefined,
            },
        ];
        state.budgetManager = '';
        state.selectedMonthlyBudgetAllocation = undefined;
        state.budgetAppliedSameAmount = undefined;
        state.initialAmount = undefined;
        state.monthlyGrowthRate = undefined;
        state.analyzedCostData = undefined;
        state.budgetEachDate = [];
    };

    const getters = reactive({ });



    return {
        state,
        getters,
        ...mutations,
        reset,
    };
});
