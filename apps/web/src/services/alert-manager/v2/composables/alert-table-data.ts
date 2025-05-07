import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ValueHandler } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { ALERT_STATUS } from '@/schema/alert-manager/alert/constants';
import type { AlertStatusType, AlertUrgencyType } from '@/schema/alert-manager/alert/type';
import { i18n } from '@/translations';

import type { AppReferenceMap } from '@/store/reference/app-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

export const getAlertStateI18n = (): ComputedRef<Record<AlertStatusType, TranslateResult>> => computed(() => ({
    ALL: i18n.t('ALERT_MANAGER.ALERTS.ALL'),
    TRIGGERED: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'),
    ACKNOWLEDGED: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'),
    RESOLVED: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'),
    IGNORED: i18n.t('ALERT_MANAGER.ALERTS.IGNORED'),
}));

export const getAlertUrgencyI18n = (): ComputedRef<Record<AlertUrgencyType, TranslateResult>> => computed(() => ({
    ALL: i18n.t('ALERT_MANAGER.ALERTS.ALL'),
    HIGH: i18n.t('ALERT_MANAGER.ALERTS.HIGH'),
    LOW: i18n.t('ALERT_MANAGER.ALERTS.LOW'),
}));

export const alertStatusBadgeStyleTypeFormatter = (alertState) => {
    let style = '';
    switch (alertState) {
    case ALERT_STATUS.TRIGGERED:
        style = 'alert';
        break;
    case ALERT_STATUS.ACKNOWLEDGED:
        style = 'primary3';
        break;
    case ALERT_STATUS.RESOLVED:
        style = 'gray200';
        break;
    case ALERT_STATUS.IGNORED:
        style = 'peacock200';
        break;
    default: style = '';
        break;
    }
    return style;
};

export const calculateTime = (time: string, timezone: string): string => {
    const createdTime = dayjs.tz(time, timezone);
    const todayTime = dayjs().tz(timezone);
    const timeForCalculate = todayTime.diff(createdTime, 'minute');
    const days = Math.floor(timeForCalculate / 1440);
    const hours = Math.floor((timeForCalculate % 1440) / 60);
    const minutes = timeForCalculate % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);

    return parts.join(' ') || '0m';
};

export const makeTriggeredValueHandler = ({
    webhooks,
    apps,
}: { webhooks: WebhookReferenceMap, apps: AppReferenceMap }): ValueHandler|undefined => async () => {
    try {
        const { results } = await SpaceConnector.client.addOns.autocomplete.distinct({
            resource_type: 'alert_manager.Alert',
            distinct_key: 'triggered_by',
        });

        return {
            results: results.reduce((r, d) => {
                if (d.name !== '' && d.name !== undefined && d.name !== null) {
                    if (d.key.includes('webhook')) {
                        r.push({ label: webhooks[d.key].label, name: d.key });
                    } else if (d.key.includes('app')) {
                        r.push({ label: apps[d.key].label, name: d.key });
                    } else {
                        r.push({ label: d.name, name: d.key });
                    }
                }
                return r;
            }, []),
            totalCount: results.length,
        };
    } catch (e) {
        return {
            results: [],
            totalCount: 0,
        };
    }
};
