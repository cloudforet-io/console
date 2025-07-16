
export type NotificationResourceType = 'identity.Project' | 'identity.User';

export type NotificationType = 'INFO' | 'ERROR' | 'SUCCESS' | 'WARNING';

export type NotificationLevel = 'ALL' | 'LV1' | 'Lv1' | 'LV3' | 'LV4' | 'LV5';

export type NotificationMessage = {
    title: string;
    link: string;
    description: string;
    short_description: string;
    contents: string;
    content_type: 'HTML' | 'MARKDOWN';
    image_url: string;
    tags: {
            key: string;
            value: string;
            options: {
                short: boolean;
            }
        }[];
    callbacks: {
            label: string;
            url: string;
            options: string;
        }[];
    occurred_at: string;
};
