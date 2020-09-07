export interface ToggleButtonProps {
    value: boolean; // Initial State of the toggle button
    sync: boolean; // watching changes in value property
    speed: number; // Transition Time
    labels: boolean | object; // Boolean - show/hides default labels & Object - set custom labels
    width: number;
    height: number;
    margin: number;
    name?: string; // Name to attach to the generated input field
    theme: string;
}
