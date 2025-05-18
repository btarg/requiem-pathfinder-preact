import { useEffect, useState, useContext, useRef } from 'preact/hooks'
import { CharacterContext } from '../context/CharacterContext'
import { Tooltip } from 'bootstrap';
import './HitPoints.scss'
import DecorativeTitle from './DecorativeTitle'
import ProgressBar from './ProgressBar'

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

    // Refs for double-click detection on progress bars
    const hpBarClickTimeoutRef = useRef(null);
    const mpBarClickTimeoutRef = useRef(null);
    const DOUBLE_CLICK_DELAY = 300; // ms

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

    // Health management functions
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
        updateHealth({
            currentHealth: Math.min(characterStats.maxHealth, characterStats.currentHealth + amount)
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
            setAmount(characterStats.maxHealth || 0);
        } else {
            setAmount(prev => Math.min(prev + 1, characterStats.maxHealth || Infinity));
        }
    };

    const handleDecrementAmount = () => {
        if (isCtrlPressed) {
            setAmount(0);
        } else {
            setAmount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMaxHealthChange = (e) => {
        const target = e.currentTarget;
        const newMax = Math.max(1, parseInt(target.value) || 1);
        updateHealth({ maxHealth: newMax });
        if (characterStats.currentHealth > newMax) {
            updateHealth({ currentHealth: newMax });
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

    const handleMaxMpChange = (e) => {
        const target = e.currentTarget;
        const newMax = Math.max(1, parseInt(target.value) || 1);
        updateHealth({ maxMp: newMax });
        if (characterStats.currentMp > newMax) {
            updateHealth({ currentMp: newMax });
        }
    };

    const handleSetHp = () => {
        const newHealth = Math.max(0, Math.min(characterStats.maxHealth, amount));
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
        updateHealth({ currentHealth: characterStats.maxHealth });
        setHealed(true);
    };

    const handleFullRestoreMp = () => {
        if (characterStats.maxMp === undefined) return;
        updateHealth({ currentMp: characterStats.maxMp });
        setMpChanged(true);
    };

    const handleHpBarClick = () => {
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
    };

    const handleMpBarClick = () => {
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
    };

    const safeCurrentHealth = characterStats.currentHealth || 0;
    const safeMaxHealth = Math.max(1, characterStats.maxHealth || 0);
    const safeTempHealth = characterStats.tempHealth || 0;

    const healthPercentage = (safeCurrentHealth / safeMaxHealth) * 100;
    const tempHealthPercentage = (safeTempHealth / safeMaxHealth) * 100;

    const safeCurrentMp = characterStats.currentMp || 0;
    const safeMaxMp = Math.max(1, characterStats.maxMp || 0);
    const mpPercentage = (safeCurrentMp / safeMaxMp) * 100;

    return (
        <div className="hit-points-component-container container-fluid mb-4">

            <div className="row align-items-center mb-3"> {/* MODIFIED: Removed justify-content-between */}
                {/* Left Column: Character Stat values: speed, AC - Wrapped in col-auto */}
                <div className="col-auto">
                    <div className="d-flex gap-2"> {/* This div wraps the first group of inputs */}
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Speed</small>
                            <input
                                type="number"
                                className="form-control form-control hp-input text-center bg-dark text-light"
                                id="maxHealthInput" // Note: ID and bindings might need review for "Speed"
                                value={characterStats.maxHealth || ''}
                                onChange={handleMaxHealthChange}
                                min="1"
                                aria-label="Maximum Hit Points" // Note: Label might need review for "Speed"
                            />
                        </div>
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">AC</small>
                            <input
                                type="number"
                                className="form-control form-control hp-input text-center bg-dark text-light"
                                id="maxMpInput" // Note: ID and bindings might need review for "AC"
                                value={characterStats.maxMp || ''}
                                onChange={handleMaxMpChange}
                                min="1"
                                aria-label="Maximum Mana Points" // Note: Label might need review for "AC"
                            />
                        </div>
                    </div> {/* Closing tag for the first group of inputs */}
                </div>

                {/* Right Column: Max Values - Wrapped in col-auto ms-auto */}
                <div className="col-auto ms-auto">
                    <div className="d-flex gap-2"> {/* This div wraps the second group of inputs */}
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Max HP</small>
                            <input
                                type="number"
                                className="form-control form-control hp-input text-center bg-dark text-light"
                                id="maxHealthInput"
                                value={characterStats.maxHealth || ''}
                                onChange={handleMaxHealthChange}
                                min="1"
                                aria-label="Maximum Hit Points"
                            />
                        </div>
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Max MP</small>
                            <input
                                type="number"
                                className="form-control form-control hp-input text-center bg-dark text-light"
                                id="maxMpInput"
                                value={characterStats.maxMp || ''}
                                onChange={handleMaxMpChange}
                                min="1"
                                aria-label="Maximum Mana Points"
                            />
                        </div>
                    </div> {/* Closing tag for the second group of inputs */}
                </div>
            </div>

            {/* Progress Bars Section */}
            <div className="mb-3">
                {/* HP and Temp HP Bar Group for Overlay */}
                <div
                    style={{ position: 'relative', cursor: 'pointer' }}
                    className="mb-2"
                    onClick={handleHpBarClick}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Click to Set HP to Amount (currently ${amount}), Double-click to reset HP & Temp HP`}
                    data-bs-original-title={`Click to Set HP to Amount (currently ${amount}), Double-click to reset HP & Temp HP`}
                >
                    <ProgressBar
                        value={safeCurrentHealth}
                        maxValue={safeMaxHealth}
                        color={{ from: '#ef4444', to: '#e11d48' }} // Tailwind red-500 to rose-600
                        labelRight={`${safeCurrentHealth} / ${safeMaxHealth}`}
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

                {/* MP Bar */}
                <div
                    style={{ cursor: 'pointer' }}
                    onClick={handleMpBarClick}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Click to Set MP to Amount (currently ${amount}), Double-click to Full Restore MP`}
                    data-bs-original-title={`Click to Set MP to Amount (currently ${amount}), Double-click to Full Restore MP`}
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

            <div className="row align-items-center mb-3">

                <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                    <button
                        onClick={handleUseMp}
                        className="btn btn-outline-primary btn-icon-square"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Use MP"
                    >
                        <i className="fas fa-bolt-lightning" />
                    </button>
                    <button
                        onClick={isCtrlPressed ? handleClearTempHp : handleDamage}
                        className={`btn btn-icon-square ${isCtrlPressed ? 'btn-outline-warning' : 'btn-outline-danger'}`}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={isCtrlPressed ? "Clear Temporary HP" : "Damage HP"}
                        data-bs-original-title={isCtrlPressed ? "Clear Temporary HP" : "Damage HP"}
                    >
                        {isCtrlPressed ? <i className="fas fa-times-circle" /> : <i className="fas fa-heart-circle-minus" />}
                    </button>

                    {/* Amount Input with Increment/Decrement Buttons */}
                    <div className="input-group" style={{ width: 'auto', alignItems: 'center' }}>
                        <button
                            onClick={handleDecrementAmount}
                            className="btn btn-outline-secondary btn-icon-square"
                            type="button"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={isCtrlPressed ? "Set to Min (0)" : "Decrease Amount"}
                            data-bs-original-title={isCtrlPressed ? "Set to Min (0)" : "Decrease Amount"}
                        >
                            <i className="fas fa-minus" />
                        </button>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(0, parseInt((e.currentTarget).value) || 0))}
                            className="form-control text-center bg-dark text-light"
                            min="0"
                            style={{ width: '70px', height: '40px' }}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Enter amount"
                            aria-label="Amount for HP/MP changes"
                        />
                        <button
                            onClick={handleIncrementAmount}
                            className="btn btn-outline-secondary btn-icon-square"
                            type="button"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={isCtrlPressed ? `Set to Max (${characterStats.maxHealth || 0})` : "Increase Amount"}
                            data-bs-original-title={isCtrlPressed ? `Set to Max (${characterStats.maxHealth || 0})` : "Increase Amount"}
                        >
                            <i className="fas fa-plus" />
                        </button>
                    </div>

                    <button
                        onClick={isCtrlPressed ? handleTempHeal : handleHeal}
                        className={`btn btn-icon-square ${isCtrlPressed ? 'btn-outline-info' : 'btn-outline-success'}`}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={isCtrlPressed ? "Heal Temporary HP" : "Heal HP"}
                        data-bs-original-title={isCtrlPressed ? "Heal Temporary HP" : "Heal HP"}
                    >
                        {isCtrlPressed ? <i className="fas fa-heart-pulse" /> : <i className="fas fa-heart-circle-plus" />}
                    </button>
                    <button
                        onClick={handleRestoreMp}
                        className="btn btn-outline-info btn-icon-square"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Restore MP"
                        data-bs-original-title="Restore MP"
                    >
                        <i className="fas fa-droplet" />
                    </button>
                </div>
            </div>

            {/* Conditions Tracker Row */}
            <div className="row mt-4">
                <div className="col-12">
                    <DecorativeTitle title="CONDITIONS" />
                    <div className="conditions-tracker-placeholder p-3 border rounded bg-dark-subtle">
                        <h5 className="text-secondary-emphasis">CONDITIONS TRACKER</h5>
                        <p className="text-muted">(Placeholder for future implementation)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}