const DecorativeTitle = ({
    title,
    titleClassName = "text-danger",
    lineColor = "var(--bs-danger)",
    lineThickness = "1px",
    containerClassName = "mb-3",
    lineMaxWidth = "none" // New prop: 'none' for full grow, or e.g., "50px", "30%"
}) => {
    const lineStyle = {
        height: lineThickness,
        maxWidth: lineMaxWidth, // Apply the max width
    };

    return (
        // Outer container takes the user-provided classes
        <div className={containerClassName}>
            {/* Inner container handles the flex layout and centering */}
            <div className="d-flex align-items-center justify-content-center">
                {/* Left line with fade */}
                <div
                    className="flex-grow-1" // Still allows growing up to maxWidth and shrinking
                    style={{
                        ...lineStyle,
                        backgroundImage: `linear-gradient(to right, transparent, ${lineColor})`
                    }}
                ></div>
                <h5 className={`${titleClassName} mx-3 my-0 arsenal`}>{title}</h5>
                {/* Right line with fade */}
                <div
                    className="flex-grow-1" // Still allows growing up to maxWidth and shrinking
                    style={{
                        ...lineStyle,
                        backgroundImage: `linear-gradient(to left, transparent, ${lineColor})`
                    }}
                ></div>
            </div>
        </div>
    );
};

export default DecorativeTitle;