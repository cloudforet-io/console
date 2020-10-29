import { Service } from '@/lib/fluent-api/toolset';
import AutoComplete from '@/lib/fluent-api/add-ons/autocomplete';

export default class AddOns extends Service {
    protected name = 'add-ons';

    autocomplete() { return new AutoComplete(this.api, this.name); }
}
