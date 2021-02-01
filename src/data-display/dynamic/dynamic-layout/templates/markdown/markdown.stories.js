/* eslint-disable camelcase */
import {
    object, text, select,
} from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PDynamicLayout from '@/organisms/dynamic-layout/PDynamicLayout.vue';
import md from '@/organisms/dynamic-layout/PDynamicLayout.md';

export default {
    title: 'Others/Dynamic/DynamicLayout/Markdown',
    component: PDynamicLayout,
    parameters: {
        notes: md,
    },
};

export const defaultCase = () => ({
    components: { PDynamicLayout },
    template: `
        <div class="w-screen bg-white">
            <PDynamicLayout :name="name" 
                            type="markdown"
                            :options="options" 
                            :timezone="timezone"
                            @init="onInit"
            />
        </div>`,
    props: {
        name: {
            default: text('name', 'Doc Name'),
        },
        options: {
            default: object('options', {
                markdown: `
                            ## Header
                            
                            # h1 Heading 8-)
                            ## h2 Heading
                            ### h3 Heading
                            #### h4 Heading
                            ##### h5 Heading
                            ###### h6 Heading
                            
                            
                            ## Horizontal Rules
                            
                            bar 1
                            
                            ___
                            
                            bar 2
                            
                            ---
                            
                            bar 3
                            
                            ***
                            
                            
                            
                            ## Emphasis
                            
                            **This is bold text**
                            
                            __This is bold text__
                            
                            *This is italic text*
                            
                            _This is italic text_
                            
                            ~~Strikethrough~~
                            
                            
                            ## Blockquotes
                            
                            > Blockquotes!!!
                            
                            > > nested Blockquotes
                            
                            
                            ## Lists
                            
                            Unordered
                            
                            + Create a list by starting a line with \`+\`, \`-\`, or \`*\`
                            + Sub-lists are made by indenting 2 spaces:
                              - Marker character change forces new list start:
                                * Ac tristique libero volutpat at
                                + Facilisis in pretium nisl aliquet
                                - Nulla volutpat aliquam velit
                            + Very easy!
                            
                            Ordered
                            
                            1. Lorem ipsum dolor sit amet
                            2. Consectetur adipiscing elit
                            3. Integer molestie lorem at massa
                            
                            
                            1. You can use sequential numbers...
                            1. ...or keep all the numbers as \`1.\`
                            
                            Start numbering with offset:
                            
                            57. foo
                            1. bar
                            
                            
                            ## Code
                            
                            Inline \`code\`
                            
                            Indented code
                            
                                // Some comments
                                line 1 of code
                                line 2 of code
                                line 3 of code
                            
                            
                            Block code "fences"
                            
                            \`\`\`
                            Sample text here...
                            \`\`\`
                            
                            Syntax highlighting
                            
                            \`\`\` js
                            var foo = function (bar) {
                              return bar++;
                            };
                            
                            console.log(foo(5));
                            \`\`\`
                            
                            ## Tables
                            
                            | Option | Description |
                            | ------ | ----------- |
                            | data   | path to data files to supply the data that will be passed into templates. |
                            | engine | engine to be used for processing templates. Handlebars is the default. |
                            | ext    | extension to be used for dest files. |
                            
                            Right aligned columns
                            
                            | Option | Description |
                            | ------:| -----------:|
                            | data   | path to data files to supply the data that will be passed into templates. |
                            | engine | engine to be used for processing templates. Handlebars is the default. |
                            | ext    | extension to be used for dest files. |
                            
                            
                            ## Links
                            
                            [link text](http://dev.nodeca.com)
                            
                            
                            ## Images
                            
                            ![Minion](https://octodex.github.com/images/minion.png)
                            
                            ![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg)
                            
                            
                            `,
            }),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
    },
    setup() {
        return {
            onInit: action('init'),
        };
    },
});


export const templateMode = () => ({
    components: { PDynamicLayout },
    template: `
        <div class="w-screen bg-white">
            <PDynamicLayout :name="name" 
                            type="markdown"
                            :options="options" 
                            :typeOptions="{ timezone }"
                            :data="data"
                            @init="onInit"
            />
        </div>
    `,
    props: {
        name: {
            default: text('name', 'Template Mode - Doc Name'),
        },
        options: {
            default: object('options', {
                markdown: `
                            # Support Template 
                            
                            ## Summery
                            you are using {{data.compute.instance_type}}
                            
                            ## Security Group Rules Raw Data
                            there is {{ data.security_group_rules | length }} rules in your instance
                            \`\`\`json
                            {{data.security_group_rules | dump(2) | safe}}
                            \`\`\`
                            
                            `,
            }),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
        data: {
            default: object('data', {
                name: 'cloudone-dev-eks-cluster-adm-worker',
                primary_ip_address: '172.16.16.100',
                server_type: 'VM',
                os_type: 'LINUX',
                data: {
                    compute: {
                        az: 'ap-northeast-2a',
                        security_groups: [],
                        instance_state: 'running',
                        instance_type: 'm5.2xlarge',
                        image: 'amazon-eks-node-1.14-v20190927',
                        region: 'ap-northeast-2',
                        launched_at: '2020-04-13',
                        account_id: '072548720675',
                        keypair: '...',
                        instance_name: 'cloudone-dev-eks-cluster-adm-worker',
                    },
                    aws: {
                        lifecycle: 'norma',
                        ebs_oprimized: false,
                        iam_instance_profile: {
                            name: 'cloudone-dev-EKSAdminWorkerRole',
                            arn: 'arn:aws:iam::072548720675:instance-profile/cloudone-dev-EKSAdminWorkerRole',
                            id: 'AIPARBZB5UARS3CO3KSQF',
                        },
                    },
                    auto_scaling_group: {
                        name: 'cloudone-dev-eks-cluster-adm-worker',
                        arn: '...',
                        launch_configuration_name: 'cloudone-dev-eks-cluster_woker0120200115104205194400000001',
                        launch_configuration_arn: '...',
                    },
                    os: {
                        os_distro: 'amazonlinux',
                        os_arch: 'x86_64',
                    },
                    hardware: {
                        core: 8,
                        memory: 32,
                    },
                    security_group_rules: [
                        {
                            port_range_min: 80,
                            port_range_max: 80,
                            port: '80',
                            security_group_name: 'web security group',
                            security_group_id: '...',
                            remote_cidr: '172.16.0.0/16',
                            direction: 'inbound',
                            prtocol: 'TCP',
                            remote: '172.16.0.0/16',
                        },
                    ],
                },
                reference: {
                    resource_id: 'arn:aws:ec2:ap-northeast-2:072548720675:instance/i-0745c928020bed89f',
                    external_link: 'https://ap-northeast-2.console.aws.amazon.com/ec2/v2/home?region=ap-northeast-2#Instances:instanceId=i-0745c928020bed89f',
                },
            }),
        },
    },
    setup() {
        return {
            onInit: action('init'),
        };
    },
});

export const i18nMode = () => ({
    components: { PDynamicLayout },
    template: `
        <div class="w-screen bg-white">
            <p>If there's no matched language in markdown, first language markdown would be rendered.</p>
            <PDynamicLayout :name="name" 
                            type="markdown"
                            :options="options"
                            :typeOptions="{ language, timezone }"
                            @init="onInit"
            />
        </div>
    `,
    props: {
        name: {
            default: text('name', 'Template Mode - Doc Name'),
        },
        options: {
            default: object('options', {
                markdown: {
                    en: '### Support English',
                    ko: '### 한국어 지원',
                },
            }),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
        language: {
            type: String,
            default: select('language', ['en', 'ko', 'ch'], 'ko'),
        },
    },
    setup() {
        return {
            onInit: action('init'),
        };
    },
});
