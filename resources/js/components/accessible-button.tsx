import { Button as BaseButton } from '@/components/ui/button';
import { forwardRef } from 'react';

interface AccessibleButtonProps extends React.ComponentProps<typeof BaseButton> {
    ariaLabel?: string;
    ariaDescribedBy?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
    ({ ariaLabel, ariaDescribedBy, children, ...props }, ref) => {
        return (
            <BaseButton
                ref={ref}
                aria-label={ariaLabel}
                aria-describedby={ariaDescribedBy}
                {...props}
            >
                {children}
            </BaseButton>
        );
    }
);

AccessibleButton.displayName = 'AccessibleButton';
