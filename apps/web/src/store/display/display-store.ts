import { computed, reactive } from 'vue';
import type { RawLocation, Route } from 'vue-router';
import type VueRouter from 'vue-router';

import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NotificationListParameters } from '@/schema/notification/notification/api-verbs/list';
import type { NotificationModel } from '@/schema/notification/notification/model';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { SIDEBAR_TYPE } from '@/store/display/constant';
import type {
    DisplayMenu, DisplayStoreState, SidebarProps, SidebarType,
    DisplayStoreGetters,
} from '@/store/display/type';
import { useDomainStore } from '@/store/domain/domain-store';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import type { Menu, MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import {
    ADMIN_MENU_LIST,
    ADMIN_MENU_LIST_FOR_ALERT_MANAGER_V2,
    MENU_LIST,
    MENU_LIST_FOR_ALERT_MANAGER_V2,
} from '@/lib/menu/menu-architecture';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


const verbose = false;
const filterMenuByRoute = (menuList: DisplayMenu[], router: VueRouter): DisplayMenu[] => menuList.reduce((results, _menu) => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const targetWorkspaceId = userWorkspaceStore.getters.currentWorkspaceId;
    const menu = { ..._menu };
    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByRoute(menu.subMenuList, router);
        if (menu.subMenuList.length) {
            results.push(menu);
            return results;
        }
    }

    const to: RawLocation = {
        name: menu.to.name,
        params: targetWorkspaceId ? { workspaceId: targetWorkspaceId } : {},
    };
    const link = router.resolve(to);
    if (link?.href !== '/') results.push(menu);

    return results;
}, [] as DisplayMenu[]);
const filterMenuByAccessPermission = (menuList: DisplayMenu[], pagePermissionList: MenuId[]): DisplayMenu[] => menuList.reduce((results, _menu) => {
    const menu = { ..._menu };

    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByAccessPermission(menu.subMenuList, pagePermissionList);
    }

    if (menu.subMenuList?.length) results.push(menu);
    else {
        const hasPermission = pagePermissionList.some((menuId) => menuId === menu.id);
        if (hasPermission) results.push(menu);
    }

    return results;
}, [] as DisplayMenu[]);

const taskManagementTemplateStore = useTaskManagementTemplateStore();
const getDisplayMenuList = (menuList: Menu[], isAdminMode?: boolean, currentWorkspaceId?: string): DisplayMenu[] => menuList.map((d) => {
    const menuInfo: MenuInfo = MENU_INFO_MAP[d.id];
    const routeName = isAdminMode ? makeAdminRouteName(MENU_INFO_MAP[d.id].routeName) : MENU_INFO_MAP[d.id].routeName;
    let label = i18n.t(menuInfo.translationId);
    let hideOnGNB = d.hideOnGNB;
    let hideOnSiteMap = d.hideOnSiteMap;

    // Apply templates of task management (ops-flow)
    if (d.id === MENU_ID.OPS_FLOW_LANDING) {
        label = taskManagementTemplateStore.templates.TemplateName;
        hideOnGNB = taskManagementTemplateStore.state.templateId === 'default' || !taskManagementTemplateStore.state.enableLanding;
        hideOnSiteMap = taskManagementTemplateStore.state.templateId === 'default' || !taskManagementTemplateStore.state.enableLanding;
    } else if (d.id === MENU_ID.TASK_BOARD) {
        label = taskManagementTemplateStore.templates.TaskBoard;
    }

    return {
        ...d,
        id: d.id,
        label,
        icon: menuInfo.icon,
        highlightTag: menuInfo.highlightTag,
        to: { name: routeName, params: { workspaceId: currentWorkspaceId } },
        hideOnGNB,
        hideOnSiteMap,
        subMenuList: d.subMenuList ? getDisplayMenuList(d.subMenuList, isAdminMode, currentWorkspaceId) : [],
    } as DisplayMenu;
});

const ADVANCED_SERVICE_NAMES: string[] = [MENU_ID.OPS_FLOW];
export const useDisplayStore = defineStore('display-store', () => {
    const userStore = useUserStore();
    const domainStore = useDomainStore();

    const state = reactive<DisplayStoreState>({
        visibleSidebar: false,
        sidebarType: SIDEBAR_TYPE.info as SidebarType,
        isInitialized: false,
        uncheckedNotificationCount: 0,
        uncheckedNoticeCount: 0,
        isSignInFailed: false,
        visibleMobileGuideModal: false,
        gnbNotificationLastReadTime: '',
    });

    const getters = reactive<DisplayStoreGetters>({
        hasUncheckedNotifications: computed<boolean>(() => !!(state.uncheckedNotificationCount && state.uncheckedNotificationCount > 0)),
        isHandbookVisible: computed<boolean>(() => state.visibleSidebar && (state.sidebarType === SIDEBAR_TYPE.handbook)),
        sidebarProps: computed<Partial<SidebarProps>>(() => {
            if (state.sidebarType === SIDEBAR_TYPE.info) {
                return {
                    styleType: 'primary',
                    disableButton: false,
                    size: 'md',
                    disableScroll: false,
                };
            }
            if (state.sidebarType === SIDEBAR_TYPE.handbook) {
                return {
                    styleType: 'secondary',
                    disableButton: false,
                    size: 'md',
                    disableScroll: true,
                };
            }
            if (state.sidebarType === SIDEBAR_TYPE.widget) {
                return {
                    styleType: 'primary',
                    disableButton: true,
                    size: 'md',
                    isFixedSize: true,
                    disableScroll: false,
                };
            }
            return { styleType: 'primary', disableButton: false, size: 'md' };
        }),
    });

    /* Mutations */
    const setVisibleSidebar = (val: boolean) => { state.visibleSidebar = val; };
    const setSidebarType = (val: SidebarType) => { state.sidebarType = val; };
    const setIsInitialized = (val: boolean) => { state.isInitialized = val; };
    const setUncheckedNotificationCount = (val: number) => { state.uncheckedNotificationCount = val; };
    const setIsSignInFailed = (val: boolean) => { state.isSignInFailed = val; };
    const setVisibleMobileGuideModal = (val: boolean) => { state.visibleMobileGuideModal = val; };
    const setGnbNotificationLastReadTime = (val: string) => {
        state.gnbNotificationLastReadTime = val;
    };

    const mutations = {
        setVisibleSidebar,
        setSidebarType,
        setIsInitialized,
        setUncheckedNotificationCount,
        setIsSignInFailed,
        setVisibleMobileGuideModal,
        setGnbNotificationLastReadTime,
    };

    /* Actions */
    const showHandbook = () => {
        state.sidebarType = SIDEBAR_TYPE.handbook;
        state.visibleSidebar = true;
    };
    const showInfo = () => {
        state.sidebarType = SIDEBAR_TYPE.info;
        state.visibleSidebar = true;
    };
    const showWidget = () => {
        state.sidebarType = SIDEBAR_TYPE.widget;
        state.visibleSidebar = true;
    };
    const fixedCheckNotificationFilter: ConsoleFilter = { k: 'is_read', v: false, o: '=' };
    const checkNotificationQueryHelper = new ApiQueryHelper().setCountOnly();
    const getNotificationListParam = (userId: string, currentTime: Dayjs, lastNotificationReadTime?: Dayjs) => {
        /* caution
         * Do not use iso string in api request here. */
        checkNotificationQueryHelper.setFilters([
            fixedCheckNotificationFilter,
            { k: 'created_at', v: currentTime.format('YYYY-MM-DD HH:mm:ss'), o: '<=t' },
            { k: 'user_id', v: userId, o: '=' },
        ]);

        const minimumCheckTime = currentTime.subtract(7, 'day');

        if (lastNotificationReadTime && lastNotificationReadTime.isAfter(minimumCheckTime)) {
            checkNotificationQueryHelper.addFilter(
                { k: 'created_at', v: lastNotificationReadTime.format('YYYY-MM-DD HH:mm:ss'), o: '>t' },
            );
        } else {
            checkNotificationQueryHelper.addFilter(
                { k: 'created_at', v: minimumCheckTime.format('YYYY-MM-DD HH:mm:ss'), o: '>=t' },
            );
        }

        return {
            query: checkNotificationQueryHelper.data,
        };
    };

    const updateGnbNotificationLastReadTime = (lastReadTime: string) => {
        state.gnbNotificationLastReadTime = lastReadTime;

        // set local storage
        const userId = userStore.state.userId || '';
        const settings = LocalStorageAccessor.getItem(userId) ?? {};
        const global = settings.global || {};
        LocalStorageAccessor.setItem(userId, {
            ...settings,
            global: {
                ...global,
                gnbNotificationLastReadTime: lastReadTime,
            },
        });
    };

    let notificationListApiToken: CancelTokenSource | undefined;
    const checkNotification = async (): Promise<void> => {
        if (notificationListApiToken) {
            if (verbose) console.debug('[CHECK NOTI]', ' pending...');
            return;
        }
        try {
            if (verbose) console.debug('[CHECK NOTI]', ' start');
            notificationListApiToken = axios.CancelToken.source();

            const currentTime = dayjs.tz(dayjs.utc(), userStore.state.timezone);
            const lastNotificationReadTimeStr = state.gnbNotificationLastReadTime;
            const lastNotificationReadTime = lastNotificationReadTimeStr ? dayjs(lastNotificationReadTimeStr).tz(userStore.state.timezone) : undefined;
            const param = getNotificationListParam(
                userStore.state.userId || '',
                currentTime,
                lastNotificationReadTime,
            );
            if (verbose) console.debug('[NOTI QUERY.FILTER]', param.query.filter);
            const { total_count } = await SpaceConnector.clientV2.notification.notification.list<NotificationListParameters, ListResponse<NotificationModel>>(param, {
                cancelToken: notificationListApiToken.token,
            });

            if (state.uncheckedNotificationCount !== total_count) {
                state.uncheckedNotificationCount = total_count;
            }
        } catch (e: any) {
            if (!axios.isCancel(e.axiosError)) {
                ErrorHandler.handleError(e);
            }
        } finally {
            notificationListApiToken = undefined;
            if (verbose) console.debug('[CHECK NOTI]', ' finished');
        }
    };

    let checkNotificationInterval: undefined|ReturnType<typeof setTimeout>;
    const stopCheckNotification = (): void => {
        if (notificationListApiToken) {
            if (verbose)console.debug('[NOTI API]', 'canceled');
            notificationListApiToken.cancel();
            notificationListApiToken = undefined;
        }

        if (checkNotificationInterval) {
            if (verbose)console.debug('[NOTI INTERVAL]', 'stopped');
            clearInterval(checkNotificationInterval);
            checkNotificationInterval = undefined;
        }
    };

    const startCheckNotification = (): void => {
        if (notificationListApiToken) {
            if (verbose)console.debug('[NOTI API]', 'previous canceled');
            notificationListApiToken.cancel();
            notificationListApiToken = undefined;
        }
        if (checkNotificationInterval) {
            if (verbose)console.debug('[NOTI INTERVAL]', 'previous stopped');
            clearInterval(checkNotificationInterval);
        } else {
            if (verbose) console.debug('[NOTI INTERVAL]', 'start');
            checkNotification();
        }

        checkNotificationInterval = setInterval(() => {
            checkNotification();
        }, 10000);
    };

    const initSettings = (): void => {
        const userId = userStore.state.userId || '';
        try {
            const settings = LocalStorageAccessor.getItem(userId);

            if (settings?.global) {
                state.gnbNotificationLastReadTime = settings.global.gnbNotificationLastReadTime;
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            LocalStorageAccessor.removeItem(userId);
        }
    };

    const getAllMenuList = (route: Route): DisplayMenu[] => {
        const isMyPage = route.path.startsWith('/my-page');
        const appContextStore = useAppContextStore();
        const appContextState = appContextStore.$state;
        const userWorkspaceStore = useUserWorkspaceStore();
        const isAlertManagerVersionV2 = (config.get('ADVANCED_SERVICE')?.alert_manager_v2 ?? []).includes(domainStore.state.domainId);
        const menuListByVersion = (isAlertManagerVersionV2 ? MENU_LIST_FOR_ALERT_MANAGER_V2 : MENU_LIST);
        const adminMenuListByVersion = (isAlertManagerVersionV2 ? ADMIN_MENU_LIST_FOR_ALERT_MANAGER_V2 : ADMIN_MENU_LIST);
        const isAdminMode = appContextState.getters.isAdminMode;
        const currentWorkspaceId = userWorkspaceStore.getters.currentWorkspaceId;
        const menuList = isAdminMode ? adminMenuListByVersion : menuListByVersion;
        let _allGnbMenuList: DisplayMenu[];

        _allGnbMenuList = getDisplayMenuList(menuList, isAdminMode, currentWorkspaceId);
        _allGnbMenuList = filterMenuByRoute(_allGnbMenuList, SpaceRouter.router);
        if (!isAdminMode) {
            _allGnbMenuList = filterMenuByAccessPermission(_allGnbMenuList, userStore.getters.pageAccessPermissionList);
        }

        if (!isMyPage) {
            _allGnbMenuList.forEach((menu) => {
                if (menu.id === MENU_ID.MY_PAGE) {
                    menu.hideOnGNB = true;
                }
            });
        }

        const advanceService: Record<string, string[]>|undefined = config.get('ADVANCED_SERVICE');
        if (advanceService) {
            _allGnbMenuList = _allGnbMenuList.filter((menu) => {
                if (ADVANCED_SERVICE_NAMES.includes(menu.id as string)) {
                    return advanceService[menu.id]?.includes(domainStore.state.domainId);
                }
                return true;
            });
        }

        return _allGnbMenuList;
    };

    const actions = {
        showHandbook,
        showInfo,
        showWidget,
        initSettings,
        stopCheckNotification,
        startCheckNotification,
        updateGnbNotificationLastReadTime,
        getAllMenuList,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
