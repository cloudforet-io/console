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
        setName(name: string) {
            state.name = name;
        },
        setKey(key: string) {
            state.key = key;
        },
        setMember(member: ServiceMemberType) {
            state.member = member;
        },
        setDescription(description: string) {
            state.description = description;
        },
    };

    return {
        state,
        ...actions,
    };
});
