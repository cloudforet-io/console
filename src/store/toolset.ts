import {
    computed, getCurrentInstance, reactive,
} from '@vue/composition-api';
import Lockr from 'lockr';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { api } from '@/lib/api/axios';
import { fluentApi } from '@/lib/fluent-api';
import config from '@/lib/config';

const bindLocalStorage = (prefix: string, name: string, state: any) => computed({
    get: () => state[name],
    set: (val) => {
        state[name] = val;
        Lockr.prefix = prefix;
        Lockr.set(name, val);
    },
});


const initData = (prefix: string, names: string[]) => {
    const init: any = {};
    Lockr.prefix = prefix;
    names.forEach((name) => {
        init[name] = Lockr.get(name);
    });
    return init;
};

const initState = (prefix: string, names: string[], data: any) => {
    const state: any = {};
    names.forEach((name) => {
        state[name] = bindLocalStorage(prefix, name, data);
    });
    return state;
};

abstract class Store<T> {
    state: T;

    protected data: any;

    protected constructor(protected prefix: string, protected names: string[]) {
        this.data = reactive({ ...initData(this.prefix, this.names) });
        this.state = reactive({}) as T;
    }

    protected getLockr = () => {
        Lockr.prefix = this.prefix;
        return Lockr;
    };

    reset() {
        this.getLockr().flush();
    }
}

interface UserState {
    refreshToken: string|null;
    accessToken: string|null;
    language: string|null;
    timezone: string|null;
    userId: string|null;
    userType: 'USER'|'DOMAIN_OWNER'|null;
    isDomainOwner: Readonly<boolean>;
    isSignedIn: Readonly<boolean>;
    userUrl: Readonly<string>;
    paramIdName: Readonly<string>;
}

class UserStore extends Store<UserState> {
    constructor(prefix: string) {
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

    setToken(refresh: string, access: string) {
        this.state.refreshToken = refresh;
        this.state.accessToken = access;
    }

    async setUser(userType: 'USER'|'DOMAIN_OWNER', userId: string, vm: any) {
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
        localStorage.setItem('user/language', this.state.language as string);
        localStorage.setItem('user/timezone', this.state.timezone as string);
    }

    sync(data: Partial<UserState>) {
        if (data) {
            _.forEach(data, (d, k) => {
                if (this.state[k] !== d) {
                    this.state[k] = d;
                    localStorage.setItem(`user/${k}`, typeof d === 'string' ? d : JSON.stringify(d));
                }
            });
        }
    }
}

interface DomainState {
    domainId: string;
    domainName: string;
    authType: string;
    pluginOption: any;
    isLocalType: Readonly<boolean>;
}
class DomainStore extends Store<DomainState> {
    constructor(prefix: string) {
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

    getDomain= async (vm: any) => {
        const { hostname } = window.location;
        this.state.domainName = hostname.split('.')[0];
        const param = {
            name: config.get('DOMAIN_NAME_REF') === 'hostname' ? this.state.domainName : config.get('DOMAIN_NAME'),
        };
        const resp = await api.newInstance().post('/identity/domain/list', param);
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
            // console.debug('no domain');
            vm.$router.push({ name: 'error' });
        }
    }
}


interface ProjectState {
    projects: any;
    ttl: DateTime;
}

class ProjectStore extends Store<ProjectState> {
    constructor(prefix: string) {
        super(prefix, [
            'projects',
            'ttl',
        ]);
        this.state = reactive({
            ...initState(this.prefix, this.names, this.data),
        });
    }

    isExpiration(): boolean {
        let result = true;
        if (this.state.ttl) {
            result = this.state.ttl < DateTime.local();
        }
        return result;
    }

    getProject= async (force = false) => {
        const projectAPI = fluentApi.identity().project();
        if (this.isExpiration() || force) {
            const result = {};
            try {
                const res = await projectAPI.list().setOnly('project_id', 'name', 'project_group').execute();
                res.data.results.forEach((project) => {
                    result[project.project_id] = `${project.project_group_info.name}/${project.name}`;
                });
                this.state.ttl = DateTime.local().plus({ hours: 1 });
            } catch (e) {
                console.error(e);
            }
            this.state.projects = result;
        }
    }

    Projects= async () => {
        const projectAPI = fluentApi.identity().project();
        const result = {};
        try {
            const res = await projectAPI.list().setOnly('project_id', 'name', 'project_group').execute();
            res.data.results.forEach((project) => {
                result[project.project_id] = `${project.project_group_info.name}/${project.name}`;
            });
            this.state.ttl = DateTime.local().plus({ hours: 1 });
        } catch (e) {
            console.error(e);
        }
        this.state.projects = result;
    }
}
export interface ProviderInfo{
    [provider: string]: {
        name: string;
        icon: string;
        color: string;
    };
}

interface ProviderState {
    providers: ProviderInfo;
    ttl: DateTime;
}

class ProviderStore extends Store<ProviderState> {
    constructor(prefix: string) {
        super(prefix, [
            'providers',
            'ttl',
        ]);
        this.state = reactive({
            ...initState(this.prefix, this.names, this.data),
        });
    }

    isExpiration(): boolean {
        let result = true;
        if (this.state.ttl) {
            result = this.state.ttl < DateTime.local();
        }
        return result;
    }

    getProvider = async () => {
        // console.debug('isEXP?', this.isExpiration());
        const providerAPI = fluentApi.identity().provider();
        if (this.isExpiration()) {
            const result = {};
            try {
                // console.debug('request provider');
                const res = await providerAPI.list().execute();

                res.data.results.forEach((provider) => {
                    result[provider.provider] = {
                        name: provider.name,
                        icon: provider.tags?.icon,
                        color: provider.tags?.color,
                    };
                });
                this.state.ttl = DateTime.local().plus({ hours: 1 });
            } catch (e) {
                console.debug(e);
            }
            this.state.providers = result;
        }
    }
}
export type ProviderStoreType = ProviderStore;

export default {
    name: 'LocalStorage',
    setup() {
        const state = {
            user: new UserStore('user/'),
            domain: new DomainStore('domain/'),
            project: new ProjectStore('project/'),
            provider: new ProviderStore('provider/'),
        };
        return {
            ...state,
            logout(vm?: any) {
                let routerMeta: any = null;
                if (vm) {
                    routerMeta = {
                        name: vm.$ls.user.state.isDomainOwner ? 'AdminLogin' : 'Login',
                    };
                    if (vm.$route && vm.$route.path) {
                        routerMeta.query = { nextPath: vm.$route.path };
                    }
                }
                state.user.reset();
                state.domain.reset();
                state.project.reset();
                state.provider.reset();
                if (vm) {
                    // console.debug(routerMeta);
                    vm.$router.push(routerMeta);
                }
            },
            resetAll() {
                Object.values(state).forEach(store => store.reset());
            },
        };
    },

};

export const useStore = () => {
    const vm = getCurrentInstance() as any;
    return vm.$ls as {
        user: UserStore;
        domain: DomainStore;
        project: ProjectStore;
        provider: ProviderStore;
        logout: Function;
    };
};
