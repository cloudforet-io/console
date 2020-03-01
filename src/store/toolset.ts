import { computed, reactive, Ref } from '@vue/composition-api';
import Lockr from 'lockr';

const bindLocalStorage = (prefix:string, name:string, state:any) => computed({
    get: () => state[name],
    set: (val) => {
        state[name] = val;
        Lockr.prefix = prefix;
        Lockr.set(name, val);
    },
});


const initData = (prefix:string, names:string[]) => {
    const init :any = {};
    Lockr.prefix = prefix;
    names.forEach((name) => {
        init[name] = Lockr.get(name);
    });
    return init;
};

const initState = (prefix:string, names:string[], data:any) => {
    const state :any = {};
    names.forEach((name) => {
        state[name] = bindLocalStorage(prefix, name, data);
    });
    return state;
};

abstract class Store<T> {
    public state:T;

    protected data:any;

    protected constructor(protected prefix:string, protected names: string[]) {
        this.data = reactive({ ...initData(this.prefix, this.names) });
        this.state = reactive({}) as T;
    }

    protected getLockr = () => {
        Lockr.prefix = this.prefix;
        return Lockr;
    };

    public reset() {
        this.getLockr().flush();
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
            ...initState(this.prefix, this.names, this.data),
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
