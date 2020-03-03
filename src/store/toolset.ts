import {
    computed, getCurrentInstance, reactive, Ref,
} from '@vue/composition-api';
import Lockr from 'lockr';
import _ from 'lodash';

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
    userType:'USER'|'DOMAIN_OWNER'|null;
    isLocalType:Readonly<boolean>;
    isDomainOwner:Readonly<boolean>;
    isSignedIn:Readonly<boolean>;
    userUrl:Readonly<string>;
    paramIdName:Readonly<string>;
}

class UserStore extends Store<UserState> {
    public constructor(prefix:string) {
        super(prefix, [
            'refreshToken',
            'accessToken',
            'language',
            'timezone',
            'userType',
            'userId',
        ]);
        this.state = reactive({
            ...initState(prefix, this.names, this.data),
            isSignedIn: computed(() => !!this.state.refreshToken),
            isDomainOwner: computed(() => this.state.userType === 'DOMAIN_OWNER'),
            userUrl: computed(() => (this.state.isDomainOwner ? '/identity/domain-owner/get' : '/identity/user/get')),
            paramIdName: computed(() => (this.state.isDomainOwner ? 'owner_id' : 'user_id')),
        });
    }

    public setToken(refresh:string, access:string) {
        this.state.refreshToken = refresh;
        this.state.accessToken = access;
    }

    public async setUser(userType:'USER'|'DOMAIN_OWNER', userId:string, vm : any) {
        this.state.userId = userId;
        this.state.userType = userType;

        const resp = await vm.$http.post(this.state.userUrl, {
            domain_id: vm.$ls.domain.state.domainId,
            [this.state.paramIdName]: this.state.userId,
            // eslint-disable-next-line camelcase
            user_type: this.state.userType,
        });
        const data = _.get(resp, 'data', {});
        this.state.language = data.language || 'en';
        this.state.timezone = data.timezone || 'UTC';
    }
}

interface DomainState {
    domainId:string;
    domainName:string;
    authType:string;
    pluginOption:any;
}
class DomainStore extends Store<DomainState> {
    public constructor(prefix:string) {
        super(prefix, [
            'domainId',
            'domainName',
            'authType',
            'pluginOption',
        ]);
        this.state = reactive({
            ...initState(this.prefix, this.names, this.data),
            isLocalType: computed(() => this.state.authType === 'local'),
        });
    }

    public getDomain= async (vm:any) => {
        const { hostname } = window.location;
        this.state.domainName = hostname.split('.')[0];
        const resp = await vm.$http.post('/identity/domain/list', {
            name: this.state.domainName,
        }).catch(() => {
            vm.$router.push({ name: 'error' });
        });
        const domain = _.get(resp, 'data.results.0', null);
        if (domain) {
            this.state.domainId = domain.domain_id;
            if (domain.plugin_info) {
                this.state.pluginOption = domain.plugin_info.options;
                this.state.authType = domain.plugin_info.options.auth_type;
            } else {
                this.state.authType = 'local';
            }
        } else {
            vm.$router.push({ name: 'error' });
        }
    }
}


export default {
    name: 'LocalStorage',
    setup() {
        const state = {
            user: new UserStore('user/'),
            domain: new DomainStore('domain/'),
        };
        return {
            ...state,
            logout(vm?:any) {
                state.user.reset();
                state.domain.reset();
                if (vm) {
                    vm.$router.push({ name: 'LogIn' });
                }
            },
            resetAll() {
                Object.values(state).forEach(store => store.reset());
            },
        };
    },

};
