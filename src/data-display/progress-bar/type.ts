interface Gradient {
    startColor: string;
    gradientPoint: number;
    endColor: string;
}

export interface ProgressBarProps {
    percentage: number;
    label?: string;
    color?: string;
    gradient?: Gradient;
    height?: string;
    borderRadius?: string;
}
