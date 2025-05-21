import './ProgressBar.scss';

const ProgressBar = ({
    value,
    maxValue,
    color, // Can now be a single color string or an object { from: string, to: string }
    labelLeft = null,
    labelCenter = null,
    labelRight = null,
    className = "",
    isOverlay = false, // Used to make the track transparent for overlays
    trailingStartValue = null, // Health value before damage for the trail
    trailColor = "rgba(128, 128, 128, 0.5)", // Default trail color
}) => {
    // Ensure percentage is between 0 and 100 for the visual width
    const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
    let trailPercentage = 0;

    // Calculate trailPercentage if trailingStartValue is present
    if (trailingStartValue !== null) {
        trailPercentage = Math.min(Math.max((trailingStartValue / maxValue) * 100, 0), 100);
    }

    // Determine background style for the fill
    let fillBackgroundStyle = {};
    if (typeof color === 'object' && color.from && color.to) {
        fillBackgroundStyle.backgroundImage = `linear-gradient(to right, ${color.from}, ${color.to} 100%)`;
    } else {
        fillBackgroundStyle.backgroundColor = color;
    }

    return (
        <div
            class={`progress-bar-pointed-container ${className} ${isOverlay ? "progress-bar-pointed-container--overlay" : ""
                }`}
        >
            {labelLeft && (
                <span class="progress-bar-pointed__label progress-bar-pointed__label--left">
                    {labelLeft}
                </span>
            )}

            {/* Render Trail Bar if trailingStartValue has been set (is not null) */}
            {trailingStartValue !== null && (
                <div
                    class="progress-bar-pointed__trail"
                    style={{
                        width: `${trailPercentage}%`,
                        backgroundColor: trailColor,
                        // Pass the trail color for its own potential glow, if desired later
                        '--progress-trail-color': trailColor 
                    }}
                />
            )}

            <div
                class="progress-bar-pointed__fill"
                style={{
                    width: `${percentage}%`,
                    ...fillBackgroundStyle, // Apply either gradient or solid color
                }}
            >
                {labelCenter && (
                    <span class="progress-bar-pointed__label progress-bar-pointed__label--center">
                        {labelCenter}
                    </span>
                )}
            </div>
            {labelRight && (
                <span class="progress-bar-pointed__label progress-bar-pointed__label--right">
                    {labelRight}
                </span>
            )}
        </div>
    );
};

export default ProgressBar;
