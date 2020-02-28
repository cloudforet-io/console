import { computed, reactive, Ref } from '@vue/composition-api';
import Vue from 'vue';

const bindLocalStorage = (prefix:string, name:string, state:any) => {
    const path = `${prefix}/${name}`;
    return computed({
        get: () => state[path],
        set: (val) => {
            state[path] = val;
            if (val) {
                localStorage.setItem(path, JSON.stringify(val));
            } else {
                localStorage.removeItem(path);
            }
        },
    });
};


const initData = (prefix:string, names:string[]) => {
    const init :any = {};
    names.forEach((name) => {
        const path = `${prefix}/${name}`;
        let data = localStorage.getItem(path);
        if (data) {
            data = JSON.parse(data);
        }
        init[path] = data;
    });
    return init;
};

const initState = (prefix:string, names:string[], data:any) => {
    const state :any = {};
    names.forEach((name) => {
        const path = `${prefix}/${name}`;
        state[path] = bindLocalStorage(prefix, name, data);
    });
    return state;
};

abstract class Store<T> {
    public state:T;

    protected data:any;

    protected constructor(prefix:string, protected names: string[]) {
        this.data = reactive({ ...initData(prefix, this.names) });
        this.state = reactive({}) as T;
    }

    public reset() {
        this.names.forEach((name) => {
            this.state[name] = null;
        });
    }
}

interface UserState {
    refreshToken:string|null;
    accessToken:string|null;
    language:string|null;
    timezone:string|null;
    userId:string|null;
    isLocalType:Readonly<boolean>;
    isDomainOwner:Readonly<boolean>;
    isSignedIn:Readonly<boolean>;
}

class UserStore extends Store<UserState> {
    public constructor(prefix:string) {
        super(prefix, [
            'refreshToken',
            'accessToken',
            'language',
            'timezone',
            'userId',
        ]);
        this.state = reactive({
            ...initState(prefix, this.names, this.data),
            isSignedIn: computed(() => !!this.state.refreshToken),
        });
    }

    public setToken(refresh:string, access:string) {
        this.state.refreshToken = refresh;
        this.state.accessToken = access;
    }
}

interface DomainState {
    domainId:string;
}
class DomainStore extends Store<DomainState> {
    public constructor(prefix:string) {
        super(prefix, [
            'domainId',
        ]);
        this.state = reactive({
            ...initState(prefix, this.names, this.data),
        });
    }
}

export default {
    name: 'LocalStorage',
    setup() {
        const state = {
            user: new UserStore('user'),
            domain: new DomainStore('domain'),
        };
        return {
            ...state,
            authReset() {
                state.user.reset();
                state.domain.reset();
            },
            resetAll() {
                Object.values(state).forEach(store => store.reset());
            },
        };
    },

};
