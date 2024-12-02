import { reactive } from 'vue';

import { defineStore } from 'pinia';

type ServiceMemberType = {
    USER?: string[],
    USER_GROUP?: string[],
};

interface ServiceFormState {
    name: string;
    key: string;
    member: ServiceMemberType;
    description: string;
}

export const useServiceFormStore = defineStore('service-form', () => {
    const state = reactive<ServiceFormState>({
        name: '',
        key: '',
        member: {},
        description: '',
    });

    const actions = {
        setFormStep1(form: ServiceFormState) {
            state.name = form.name;
            state.key = form.key;
            state.member = form.member;
            state.description = form.description;
        },
    };

    return {
        state,
        ...actions,
    };
});
