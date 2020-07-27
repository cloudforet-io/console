import { Service, ServiceResources } from '@/lib/fluent-api/toolset';
import Excel from '@/lib/fluent-api/add-ons/excel';
import AwsHealth from '@/lib/fluent-api/add-ons/aws-health';
import PageDiscovery from '@/lib/fluent-api/add-ons/page-discovery';
import AutoComplete from '@/lib/fluent-api/add-ons/autocomplete';

export default class AddOns extends Service implements ServiceResources<'excel'> {
    protected name = 'add-ons';

    excel() { return new Excel(this.api, this.name); }

    awsHealth() { return new AwsHealth(this.api, this.name); }

    pageDiscovery() { return new PageDiscovery(this.api, this.name); }

    autocomplete() { return new AutoComplete(this.api, this.name); }
}
