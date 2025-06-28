import { useContext } from 'preact/hooks';
import { CharacterContext } from '../../context/CharacterContext';
import DecorativeTitle from '../DecorativeTitle';
import './ConditionsTracker.scss';
import { CONDITIONS_CONFIG } from '../../config/conditions';

const CONDITIONS = Object.keys(CONDITIONS_CONFIG);

const ConditionsTracker = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);

    // Initialize conditions if they don't exist - store as {conditionName: value} where value is the stack level
    const activeConditions = characterStats.conditions || {};

    const toggleCondition = (condition) => {
        const maxStack = CONDITIONS_CONFIG[condition].maxStack;
        const currentValue = activeConditions[condition] || 0;

        let newValue;
        if (currentValue === 0) {
            // If not active, set to 1
            newValue = 1;
        } else if (maxStack === 1) {
            // If max stack is 1, toggle off
            newValue = 0;
        } else {
            // If stackable, cycle through values or remove
            newValue = currentValue >= maxStack ? 0 : currentValue + 1;
        }

        setCharacterStats(prev => ({
            ...prev,
            conditions: {
                ...prev.conditions,
                [condition]: newValue === 0 ? undefined : newValue
            }
        }));
    };

    const adjustConditionValue = (condition, delta) => {
        const maxStack = CONDITIONS_CONFIG[condition].maxStack;
        const currentValue = activeConditions[condition] || 0;
        const newValue = Math.max(0, Math.min(maxStack, currentValue + delta));

        setCharacterStats(prev => ({
            ...prev,
            conditions: {
                ...prev.conditions,
                [condition]: newValue === 0 ? undefined : newValue
            }
        }));
    };

    const clearAllConditions = () => {
        setCharacterStats(prev => ({
            ...prev,
            conditions: {}
        }));
    };

    const activeCount = Object.values(activeConditions).filter(value => value > 0).length;

    return (
        <div className="conditions-tracker">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <DecorativeTitle
                    title="PLAYER CONDITION"
                    containerClassName="mb-0 flex-grow-1"
                    lineMaxWidth="30px"
                />

            </div>            <div className="conditions-grid">
                {CONDITIONS.map(condition => {
                    const maxStack = CONDITIONS_CONFIG[condition].maxStack;
                    const currentValue = activeConditions[condition] || 0;
                    const isActive = currentValue > 0;
                    const isStackable = maxStack > 1;

                    return (
                        <div
                            key={condition}
                            className={`condition-item ${isActive ? 'active' : ''} ${isStackable ? 'stackable' : ''}`}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={`${condition}${isStackable ? ` (max ${maxStack})` : ''}`}
                        >
                            <div className="condition-main" onClick={() => toggleCondition(condition)}>
                                <div className="condition-checkbox">
                                    {isActive && <i className="fas fa-check"></i>}
                                </div>
                                <span className="condition-label">
                                    {condition}
                                    {isActive && isStackable && <span className="condition-value"> {currentValue}</span>}
                                </span>
                            </div>

                            {isActive && isStackable && (
                                <div className="condition-controls">
                                    <button
                                        className="btn btn-sm condition-btn decrease"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            adjustConditionValue(condition, -1);
                                        }}

                                        title="Decrease value"
                                    >
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <button
                                        className="btn btn-sm condition-btn increase"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            adjustConditionValue(condition, 1);
                                        }}
                                        disabled={currentValue >= maxStack}
                                        title="Increase value"
                                    >
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {activeCount > 0 && (
                <div className="active-conditions-summary mt-2">
                    <small className="text-info">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {activeCount} active condition{activeCount !== 1 ? 's' : ''}
                    </small>

                    <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={clearAllConditions}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Clear all conditions"
                    >
                        <i className="fas fa-broom"></i>
                    </button>

                </div>

            )}
        </div>
    );
};

export default ConditionsTracker;