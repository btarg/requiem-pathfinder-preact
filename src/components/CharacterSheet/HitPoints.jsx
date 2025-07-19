import { useEffect, useState, useContext, useRef } from 'preact/hooks'
import { Tooltip } from 'bootstrap';
import './HitPoints.scss'
import { CharacterContext } from '../../context/CharacterContext';
import { getDrainedHPReduction } from '../../config/conditions';
import ProgressBar from './ProgressBar';
import DecorativeTitle from '../DecorativeTitle';

export default function HitPoints() {
    const { characterStats, setCharacterStats } = useContext(CharacterContext)

    const [amount, setAmount] = useState(1)
    const [damageTaken, setDamageTaken] = useState(false)
    const [healed, setHealed] = useState(false)
    const [tempDamageTaken, setTempDamageTaken] = useState(false)
    const [mpChanged, setMpChanged] = useState(false)
    const [tempHealed, setTempHealed] = useState(false)

    // State for advanced health bar animations
    const [previousMainHealth, setPreviousMainHealth] = useState(null);
    const [previousTempHealth, setPreviousTempHealth] = useState(null);
    const [isFlashingHP, setIsFlashingHP] = useState(false);
    const [isFlashingTempHP, setIsFlashingTempHP] = useState(false);

    const [isCtrlPressed, setIsCtrlPressed] = useState(false); // New state for Ctrl key

    // Refs for clearing timeouts
    const mainHealthTrailTimeoutRef = useRef(null);
    const tempHealthTrailTimeoutRef = useRef(null);

    // Refs for click detection on progress bars
    const hpBarClickTimeoutRef = useRef(null);
    const mpBarClickTimeoutRef = useRef(null);
    const longPressTimeoutRef = useRef(null);
    const DOUBLE_CLICK_DELAY = 300; // ms
    const LONG_PRESS_DELAY = 600; // ms for long press/hold

    // Track if we're in the middle of a press
    const [isPressing, setIsPressing] = useState(false);

    // Tooltip initialization and management
    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));

        // Cleanup function to destroy tooltips
        return () => {
            tooltipList.forEach(tooltip => {
                if (tooltip && typeof tooltip.dispose === 'function') {
                    tooltip.dispose();
                }
            });
        };
    }, [isCtrlPressed]); // Re-initialize if isCtrlPressed changes for dynamic titles

    // Animation effects
    useEffect(() => {
        if (damageTaken) {
            const timer = setTimeout(() => setDamageTaken(false), 300)
            return () => clearTimeout(timer)
        }
    }, [damageTaken])

    useEffect(() => {
        if (tempDamageTaken) {
            const timer = setTimeout(() => setTempDamageTaken(false), 300)
            return () => clearTimeout(timer)
        }
    }, [tempDamageTaken])

    useEffect(() => {
        if (healed) {
            const timer = setTimeout(() => setHealed(false), 300)
            return () => clearTimeout(timer)
        }
    }, [healed])

    useEffect(() => {
        if (mpChanged) {
            const timer = setTimeout(() => setMpChanged(false), 300)
            return () => clearTimeout(timer)
        }
    }, [mpChanged])

    useEffect(() => {
        if (tempHealed) {
            const timer = setTimeout(() => setTempHealed(false), 300);
            return () => clearTimeout(timer);
        }
    }, [tempHealed]);

    // Effect for Ctrl key detection
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Control') {
                setIsCtrlPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'Control') {
                setIsCtrlPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const updateHealth = (updates) => {
        setCharacterStats(prev => ({
            ...prev,
            ...updates
        }))
    }
    useEffect(() => {
        if (characterStats.currentMp === undefined || characterStats.maxMp === undefined) {
            setCharacterStats(prev => ({
                ...prev,
                currentMp: prev.currentMp || 0,
                maxMp: prev.maxMp || 10
            }))
        }
    }, [])

    const handleDamage = () => {
        // Clear any existing trail-clearing timeouts
        if (mainHealthTrailTimeoutRef.current) {
            clearTimeout(mainHealthTrailTimeoutRef.current);
            mainHealthTrailTimeoutRef.current = null; // Explicitly nullify after clearing
        }
        if (tempHealthTrailTimeoutRef.current) {
            clearTimeout(tempHealthTrailTimeoutRef.current);
            tempHealthTrailTimeoutRef.current = null; // Explicitly nullify after clearing
        }

        const currentCharacterTempHealth = characterStats.tempHealth || 0;
        let tempHpShouldTrailThisTime = false;

        // Store previous health states for trail animation
        setPreviousMainHealth(characterStats.currentHealth);
        if (currentCharacterTempHealth > 0) {
            setPreviousTempHealth(currentCharacterTempHealth);
            tempHpShouldTrailThisTime = true;
        } else {
            setPreviousTempHealth(null);
        }

        let newTempHealth = currentCharacterTempHealth;
        let newCurrentHealth = characterStats.currentHealth;
        let damageToApply = amount;
        let tempTookActualDamage = false;
        let mainTookActualDamage = false;

        // Apply damage to Temp HP first
        if (newTempHealth > 0) {
            const damageToTemp = Math.min(damageToApply, newTempHealth);
            if (damageToTemp > 0) {
                newTempHealth -= damageToTemp;
                damageToApply -= damageToTemp;
                setTempDamageTaken(true); // For input field visual feedback
                setIsFlashingTempHP(true); // Trigger flash animation for temp HP bar
                tempTookActualDamage = true;
            }
        }

        // Apply remaining damage to Current HP
        if (damageToApply > 0 && newCurrentHealth > 0) {
            const damageToMain = Math.min(damageToApply, newCurrentHealth);
            if (damageToMain > 0) {
                newCurrentHealth = Math.max(0, newCurrentHealth - damageToMain);
                setDamageTaken(true); // For input field visual feedback
                setIsFlashingHP(true); // Trigger flash animation for main HP bar
                mainTookActualDamage = true;
            }
        }

        // Manage flash state removal
        if (mainTookActualDamage) {
            setTimeout(() => setIsFlashingHP(false), 200); // Duration of flash animation
        }
        if (tempTookActualDamage) {
            setTimeout(() => setIsFlashingTempHP(false), 200); // Duration of flash animation
        }

        // Short delay before updating actual health values in context.
        // This allows the flash to be perceived on the "old" health value state.
        // The main bar fill will then animate to the new (lower) health.
        // The trail bar will start from previousMainHealth/previousTempHealth.
        setTimeout(() => {
            setCharacterStats(prev => ({
                ...prev,
                currentHealth: newCurrentHealth,
                tempHealth: newTempHealth
            }));

            // After trail animations should complete, reset previous health states
            const trailAnimationClearDelay = 1000; // e.g., 0.7s (trail width) + 0.15s (trail delay) + buffer

            // Always schedule main health trail to clear, as setPreviousMainHealth() was called.
            mainHealthTrailTimeoutRef.current = setTimeout(() => {
                // Animate trail to current health instead of abruptly removing
                setPreviousMainHealth(newCurrentHealth);
            }, trailAnimationClearDelay);

            // Schedule temp health trail to clear if a trail was initiated for this damage event.
            if (tempHpShouldTrailThisTime) {
                tempHealthTrailTimeoutRef.current = setTimeout(() => {
                    // Animate trail to current temp health instead of abruptly removing
                    setPreviousTempHealth(newTempHealth);
                }, trailAnimationClearDelay);
            }

        }, 50); // Small delay to commit stat changes after flash starts

        setAmount(1);
    }

    const handleHeal = () => {
        setHealed(true)
        const effectiveMaxHealth = Math.max(1, (characterStats.maxHealth || 0) - getDrainedHPReduction(characterStats.conditions, characterStats.level || 1));
        updateHealth({
            currentHealth: Math.min(effectiveMaxHealth, characterStats.currentHealth + amount)
        })
        setAmount(1)
    }

    const handleTempHeal = () => {
        setTempHealed(true);
        updateHealth({
            tempHealth: (characterStats.tempHealth || 0) + amount
        });
        setAmount(1);
    };

    const handleIncrementAmount = () => {
        if (isCtrlPressed) {
            const effectiveMaxHealth = Math.max(1, (characterStats.maxHealth || 0) - getDrainedHPReduction(characterStats.conditions, characterStats.level || 1));
            setAmount(effectiveMaxHealth);
        } else {
            const effectiveMaxHealth = Math.max(1, (characterStats.maxHealth || 0) - getDrainedHPReduction(characterStats.conditions, characterStats.level || 1));
            setAmount(prev => Math.min(prev + 1, effectiveMaxHealth));
        }
    };

    const handleDecrementAmount = () => {
        if (isCtrlPressed) {
            setAmount(0);
        } else {
            setAmount(prev => Math.max(0, prev - 1));
        }
    };

    const handleUseMp = () => {
        setMpChanged(true)
        updateHealth({
            currentMp: Math.max(0, characterStats.currentMp - amount)
        })
        setAmount(1)
    }

    const handleRestoreMp = () => {
        setMpChanged(true)
        updateHealth({
            currentMp: Math.min(characterStats.maxMp, characterStats.currentMp + amount)
        })
    }

    const handleSetHp = () => {
        const effectiveMaxHealth = Math.max(1, (characterStats.maxHealth || 0) - getDrainedHPReduction(characterStats.conditions, characterStats.level || 1));
        const newHealth = Math.max(0, Math.min(effectiveMaxHealth, amount));
        updateHealth({ currentHealth: newHealth });
        setHealed(true); // Re-using heal flash for generic positive change
        setAmount(1); // Reset amount input
    };

    const handleSetMp = () => {
        const newMp = Math.max(0, Math.min(characterStats.maxMp, amount)); // Changed mpAmount to amount
        updateHealth({ currentMp: newMp });
        setMpChanged(true); // Re-using mpChanged flash for generic positive change
        setAmount(1); // Reset amount input
    };

    const handleClearHp = () => {
        updateHealth({ currentHealth: 0 }); // Keep tempHealth as is, or clear both like before?
        setDamageTaken(true);
    };

    const handleClearTempHp = () => {
        updateHealth({ tempHealth: 0 });
        setTempDamageTaken(true);
    };

    const handleFullHeal = () => {
        if (characterStats.maxHealth === undefined) return;
        const effectiveMaxHealth = Math.max(1, (characterStats.maxHealth || 0) - getDrainedHPReduction(characterStats.conditions, characterStats.level || 1));
        updateHealth({ currentHealth: effectiveMaxHealth });
        setHealed(true);
    };

    const handleFullRestoreMp = () => {
        if (characterStats.maxMp === undefined) return;
        updateHealth({ currentMp: characterStats.maxMp });
        setMpChanged(true);
    };    // Handle HP bar mouse down - start the long press timer
    const handleHpBarMouseDown = (e) => {
        // Prevent default behavior for touch events to stop context menu
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        setIsPressing(true);
        longPressTimeoutRef.current = setTimeout(() => {
            // Long press action (same as double click)
            handleFullHeal();
            handleClearTempHp();
            // Hide/Reset trails by setting them to the new state
            setPreviousMainHealth(characterStats.maxHealth || safeMaxHealth);
            setPreviousTempHealth(0);
            setIsPressing(false); // Reset pressing state
            // Clear any click timeout to prevent normal click action
            if (hpBarClickTimeoutRef.current) {
                clearTimeout(hpBarClickTimeoutRef.current);
                hpBarClickTimeoutRef.current = null;
            }
        }, LONG_PRESS_DELAY);
    };

    // Handle MP bar mouse down - start the long press timer
    const handleMpBarMouseDown = (e) => {
        // Prevent default behavior for touch events to stop context menu
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        setIsPressing(true);
        longPressTimeoutRef.current = setTimeout(() => {
            // Long press action (same as double click)
            handleFullRestoreMp();
            setIsPressing(false); // Reset pressing state
            // Clear any click timeout to prevent normal click action
            if (mpBarClickTimeoutRef.current) {
                clearTimeout(mpBarClickTimeoutRef.current);
                mpBarClickTimeoutRef.current = null;
            }
        }, LONG_PRESS_DELAY);
    };    // Handle mouse up - clear the long press timer
    const handleMouseUp = (e) => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;

            // If this was a short tap/click (not a long press), process it as a click
            if (isPressing && e.type === 'touchend') {
                const targetType = e.currentTarget.getAttribute('data-bar-type');
                if (targetType === 'hp') {
                    handleHpBarClick();
                } else if (targetType === 'mp') {
                    handleMpBarClick();
                }
            }
        }
        setIsPressing(false);
    };

    // Handle mouse leave - also clear the timer
    const handleMouseLeave = () => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
        setIsPressing(false);
    };

    const handleHpBarClick = () => {
        // Only process click if we're not in the middle of a long press
        if (!isPressing) {
            if (hpBarClickTimeoutRef.current) { // Double click
                clearTimeout(hpBarClickTimeoutRef.current);
                hpBarClickTimeoutRef.current = null;
                // Double click action:
                handleFullHeal();
                handleClearTempHp();
                // Hide/Reset trails by setting them to the new state
                setPreviousMainHealth(characterStats.maxHealth || safeMaxHealth);
                setPreviousTempHealth(0);
            } else { // First click
                // Execute single click action immediately
                handleSetHp();
                // Then set timeout to detect if it's a double click
                hpBarClickTimeoutRef.current = setTimeout(() => {
                    hpBarClickTimeoutRef.current = null;
                }, DOUBLE_CLICK_DELAY);
            }
        }
    };

    const handleMpBarClick = () => {
        // Only process click if we're not in the middle of a long press
        if (!isPressing) {
            if (mpBarClickTimeoutRef.current) { // Double click
                clearTimeout(mpBarClickTimeoutRef.current);
                mpBarClickTimeoutRef.current = null;
                // Double click action:
                handleFullRestoreMp();
                // MP bar trail is simpler, its trailingStartValue is safeCurrentMp and will update naturally.
            } else { // First click
                handleSetMp();
                mpBarClickTimeoutRef.current = setTimeout(() => {
                    mpBarClickTimeoutRef.current = null;
                }, DOUBLE_CLICK_DELAY);
            }
        }
    };

    const safeCurrentHealth = characterStats.currentHealth || 0;
    const baseMaxHealth = characterStats.maxHealth || 0;
    const drainedReduction = getDrainedHPReduction(characterStats.conditions, characterStats.level || 1);
    const safeMaxHealth = Math.max(1, baseMaxHealth - drainedReduction);
    const safeTempHealth = characterStats.tempHealth || 0;

    const safeCurrentMp = characterStats.currentMp || 0;
    const safeMaxMp = Math.max(1, characterStats.maxMp || 0);
    const mpPercentage = (safeCurrentMp / safeMaxMp) * 100;

    return (
        <div className="hit-points-component-container container-fluid mb-4">

            {/* HP and MP Controls */}
            <div className="row align-items-center mb-3">
                <DecorativeTitle title="VITALS" containerClassName='mb-3' />
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                    {/* Main HP and MP Controls (Left) */}
                    <div className="input-group amount-input-container d-flex" style={{ width: 'auto', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <button
                            onClick={handleUseMp}
                            className="btn btn-outline-primary btn-icon-square d-flex flex-column align-items-center justify-content-center"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Use MP"
                            style={{ width: '50px', height: '50px' }}
                        >
                            <i className="fas fa-bolt-lightning" />
                            <span style={{ fontSize: '0.5em' }}>MP</span>
                        </button>
                        <button
                            onClick={handleDamage}
                            className="btn btn-icon-square btn-outline-danger"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Damage HP"
                            data-bs-original-title="Damage HP"
                            style={{ width: '50px', height: '50px' }}
                        >
                            <i className="fas fa-heart-circle-minus" />
                        </button>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(0, parseInt((e.currentTarget).value) || 0))}
                            className="form-control text-center bg-dark text-light"
                            min="0"
                            style={{ width: '75px', height: '50px' }}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Enter amount to heal or damage"
                            aria-label="Amount for HP/MP changes"
                        />
                        <button
                            onClick={handleHeal}
                            className="btn btn-icon-square btn-outline-success"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Heal HP"
                            data-bs-original-title="Heal HP"
                            style={{ width: '50px', height: '50px' }}
                        >
                            <i className="fas fa-heart-circle-plus" />
                        </button>
                        <button
                            onClick={handleRestoreMp}
                            className="btn btn-outline-info btn-icon-square d-flex flex-column align-items-center justify-content-center"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Restore MP"
                            data-bs-original-title="Restore MP"
                            style={{ width: '50px', height: '50px' }}
                        >
                            <i className="fas fa-droplet" />
                            <span style={{ fontSize: '0.5em' }}>MP</span>
                        </button>
                    </div>

                    {/* Temporary HP Controls (Right) */}
                    <div className="d-flex gap-2 align-items-center">
                        <button
                            onClick={handleClearTempHp}
                            className="dark-btn dark-btn-secondary d-flex align-items-center gap-2"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Clear Temporary HP"
                            data-bs-original-title="Clear Temporary HP"
                        >
                            <span>Clear Temp</span>
                            <i className="fas fa-times-circle" />
                        </button>
                        <button
                            onClick={handleTempHeal}
                            className="dark-btn dark-btn-primary d-flex align-items-center gap-2"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Heal Temporary HP"
                            data-bs-original-title="Heal Temporary HP"
                        >
                            <span>Heal Temp</span>
                            <i className="fas fa-heart-pulse" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bars Section */}
            <div className="mb-3">
                {/* HP and Temp HP Bar Group for Overlay */}
                <div
                    style={{ position: 'relative', cursor: 'pointer' }}
                    className="mb-2"
                    onClick={(e) => {
                        // Only handle click for mouse events, not touch
                        if (e.type !== 'touchend') {
                            handleHpBarClick();
                        }
                    }}
                    onMouseDown={handleHpBarMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleHpBarMouseDown}
                    onTouchEnd={handleMouseUp}
                    onTouchCancel={handleMouseLeave}
                    onContextMenu={(e) => e.preventDefault()}
                    data-bar-type="hp"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Click to Set HP to ${amount}, Long press/double click to reset HP & Temp HP`}
                    data-bs-original-title={`Click to Set HP to ${amount}, Long press/double click to reset HP & Temp HP`}
                >
                    <ProgressBar
                        value={safeCurrentHealth}
                        maxValue={safeMaxHealth}
                        color={{ from: '#ef4444', to: '#e11d48' }} // Tailwind red-500 to rose-600
                        labelRight={(() => {
                            const baseMaxHealth = characterStats.maxHealth || 0;
                            if (drainedReduction > 0) {
                                return `${safeCurrentHealth} / ${safeMaxHealth} (${baseMaxHealth} - ${drainedReduction})`;
                            }
                            return `${safeCurrentHealth} / ${safeMaxHealth}`;
                        })()}
                        trailingStartValue={previousMainHealth}
                        trailColor="rgba(200, 0, 0, 0.7)" // Darker red for trail
                        className={isFlashingHP ? 'progress-bar-damage-flash' : ''}
                    />
                    {(safeTempHealth > 0 || previousTempHealth !== null) && (
                        <ProgressBar
                            value={safeTempHealth}
                            maxValue={safeMaxHealth}
                            color={{ from: '#21d2ec', to: '#14b8a7' }}
                            labelCenter={safeTempHealth > 0 ? `${safeTempHealth} Temp` : ""}
                            isOverlay={true}
                            className={`health-overlay-bar ${isFlashingTempHP ? 'progress-bar-damage-flash' : ''}`}
                            trailingStartValue={previousTempHealth}
                            trailColor="rgba(0, 50, 200, 0.7)" // Darker blue for trail
                        />
                    )}
                </div>

                {/* MP Bar */}                <div
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                        // Only handle click for mouse events, not touch
                        if (e.type !== 'touchend') {
                            handleMpBarClick();
                        }
                    }}
                    onMouseDown={handleMpBarMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleMpBarMouseDown}
                    onTouchEnd={handleMouseUp}
                    onTouchCancel={handleMouseLeave}
                    onContextMenu={(e) => e.preventDefault()}
                    data-bar-type="mp"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Click to Set MP to ${amount}, Long press/double click to Full Restore MP`}
                    data-bs-original-title={`Click to Set MP to ${amount}, Long press/double click to Full Restore MP`}
                >
                    <ProgressBar
                        value={safeCurrentMp}
                        maxValue={safeMaxMp}
                        color={{ from: '#3c82f6', to: '#6366f1' }}
                        labelRight={`${safeCurrentMp} / ${safeMaxMp}`}
                        className={mpChanged ? 'progress-bar-damage-flash' : ''}
                        trailingStartValue={safeCurrentMp} // MP trail will show previous value before change
                        trailColor="rgba(0, 50, 200, 0.7)"
                    />
                </div>
            </div>


        </div>
    )
}