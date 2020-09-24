import { Service } from '@/lib/fluent-api/toolset';
import AwsHealth from '@/lib/fluent-api/add-ons/aws-health';
import AutoComplete from '@/lib/fluent-api/add-ons/autocomplete';

export default class AddOns extends Service {
    protected name = 'add-ons';

    awsHealth() { return new AwsHealth(this.api, this.name); }

    autocomplete() { return new AutoComplete(this.api, this.name); }
}
