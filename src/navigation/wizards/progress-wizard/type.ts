
export interface ProgressTab {
    name: string;
    label?: string;
    help?: string;
    optional?: string;
}


export interface ProgressWizardProps {
    tabs: ProgressTab[];
    activeIdx: number;
    invalidState: {
        [key: string]: boolean;
    };
    loading: boolean;
    disabled: boolean;
}
