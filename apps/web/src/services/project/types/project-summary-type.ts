import type { SERVICE_CATEGORY } from '@/services/project/constants/project-summary-constant';


export type ServiceCategory = typeof SERVICE_CATEGORY[keyof typeof SERVICE_CATEGORY];

export type DateType = 'DAILY' | 'MONTHLY';
