import type { SERVICE_CATEGORY } from '@/services/project/v1/constants/project-summary-constant';


export type ServiceCategory = typeof SERVICE_CATEGORY[keyof typeof SERVICE_CATEGORY];

export type DateType = 'DAILY' | 'MONTHLY';
