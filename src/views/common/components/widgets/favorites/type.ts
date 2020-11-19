import { FavoriteItem } from '@/store/modules/favorite/type';

export interface FavoritesWidgetProps {
    project: FavoriteItem[];
    cloudService: FavoriteItem[];
}
