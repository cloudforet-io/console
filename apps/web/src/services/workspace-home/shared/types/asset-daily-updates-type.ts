export interface DailyUpdateItem {
  provider: string;
  display_name?: string;
  //
  cloudServiceGroup: string;
  cloudServiceType: string;
  icon?: string;
  totalCount: number;
  createdCount: number;
  deletedCount: number;
}

