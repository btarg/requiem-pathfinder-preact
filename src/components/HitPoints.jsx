import { useEffect, useState, useContext, useRef } from 'preact/hooks'
import { CharacterContext } from '../context/CharacterContext'
import './HitPoints.scss'
import DecorativeTitle from './DecorativeTitle'
import ProgressBar from './ProgressBar'

export default function HitPoints() {
    const { characterStats, setCharacterStats } = useContext(CharacterContext)
    const [amount, setAmount] = useState(1)
    const [mpAmount, setMpAmount] = useState(1)
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

    // Refs for clearing timeouts
    const mainHealthTrailTimeoutRef = useRef(null);
    const tempHealthTrailTimeoutRef = useRef(null);

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

    const handleMaxHealthChange = (e) => {
        const newMax = Math.max(1, parseInt(e.currentTarget.value) || 1)
        updateHealth({ maxHealth: newMax })
        if (characterStats.currentHealth > newMax) {
            updateHealth({ currentHealth: newMax })
        }
    }

    const handleUseMp = () => {
        setMpChanged(true)
        updateHealth({
            currentMp: Math.max(0, characterStats.currentMp - mpAmount)
        })
        setMpAmount(1)
    }

    const handleRestoreMp = () => {
        setMpChanged(true)
        updateHealth({
            currentMp: Math.min(characterStats.maxMp, characterStats.currentMp + mpAmount)
        })
        setMpAmount(1)
    }

    const handleMaxMpChange = (e) => {
        const newMax = Math.max(1, parseInt(e.currentTarget.value) || 1)
        updateHealth({ maxMp: newMax })
        if (characterStats.currentMp > newMax) {
            updateHealth({ currentMp: newMax })
        }
    }

    const safeCurrentHealth = characterStats.currentHealth || 0;
    const safeMaxHealth = Math.max(1, characterStats.maxHealth || 0);
    const safeTempHealth = characterStats.tempHealth || 0;

    const healthPercentage = (safeCurrentHealth / safeMaxHealth) * 100;
    const tempHealthPercentage = (safeTempHealth / safeMaxHealth) * 100;

    const safeCurrentMp = characterStats.currentMp || 0;
    const safeMaxMp = Math.max(1, characterStats.maxMp || 0);
    const mpPercentage = (safeCurrentMp / safeMaxMp) * 100;

    return (
        <div className="mb-4">
            <div className="row justify-content-between align-items-start px-3">

                <div className="main-health-progress-container mb-4">
                    <ProgressBar
                        value={safeCurrentHealth}
                        maxValue={safeMaxHealth}
                        color="var(--bs-danger)"
                        labelRight={`${safeCurrentHealth} / ${safeMaxHealth}`}
                        trailingStartValue={previousMainHealth}
                        trailColor="rgba(200, 0, 0, 0.7)" // Darker red for trail
                        className={isFlashingHP ? 'progress-bar-damage-flash' : ''}
                    />
                    {(safeTempHealth > 0 || previousTempHealth !== null) && (
                        <ProgressBar
                            value={safeTempHealth}
                            maxValue={safeMaxHealth}
                            color="var(--bs-info)"
                            labelCenter={safeTempHealth > 0 ? `${safeTempHealth} Temp` : ""}
                            isOverlay={true}
                            className={`health-overlay-bar ${isFlashingTempHP ? 'progress-bar-damage-flash' : ''}`}
                            trailingStartValue={previousTempHealth}
                            trailColor="rgba(0, 50, 200, 0.7)" // Darker blue for trail
                        />
                    )}
                </div>

                <div className="col-lg-7">
                    <div className="hp-section d-flex flex-column align-items-sm-start mb-4">
                        <div className="d-flex justify-content-between align-items-center ">
                            <h5 className="mb-3 text-secondary-emphasis">HIT POINTS (HP)</h5>
                        </div>

                        <div className="d-flex gap-3 mb-3">
                            <div>
                                <div className="d-flex align-items-end gap-2">
                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">Temp</small>
                                        <input
                                            type="number"
                                            value={characterStats.tempHealth}
                                            onChange={(e) => updateHealth({
                                                tempHealth: Math.max(0, parseInt(e.currentTarget.value) || 0)
                                            })}
                                            className={`form-control hp-input text-center bg-dark text-light ${tempDamageTaken ? 'damage-flash' : ''} ${tempHealed ? 'temp-flash' : ''}`}
                                            min="0"
                                            style={{ fontSize: '1.5rem', height: '80px' }}
                                        />
                                    </div>

                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '10px', height: '80px' }}>
                                        <span className="h4 mb-1 text-secondary">+</span>
                                    </div>

                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">Current</small>
                                        <input
                                            type="number"
                                            value={characterStats.currentHealth}
                                            onChange={(e) => updateHealth({
                                                currentHealth: Math.max(0, Math.min(characterStats.maxHealth, parseInt(e.currentTarget.value) || 0))
                                            })}
                                            className={`form-control form-control-lg hp-input text-center bg-dark
                                                ${damageTaken ? 'damage-flash' : ''}
                                                ${healed ? 'heal-flash' : ''}
                                                ${tempDamageTaken ? 'temp-flash' : ''}`}
                                            min="0"
                                            max={characterStats.maxHealth}
                                        />
                                    </div>

                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '10px', height: '80px' }}>
                                        <span className="h4 mb-1 text-secondary">/</span>
                                    </div>

                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">Max</small>
                                        <input
                                            type="number"
                                            value={characterStats.maxHealth}
                                            onChange={handleMaxHealthChange}
                                            className="form-control form-control-lg hp-input text-center bg-dark"
                                            min="1"
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="d-flex gap-2">
                                <div className="text-center" style={{ width: '80px', height: '80px' }}>
                                    <br />
                                    <button
                                        onClick={handleDamage}
                                        className="btn btn-outline-danger flex-grow-1"
                                        style={{ width: '80px', height: '80px' }}
                                    >
                                        <i className="fas fa-heart-circle-minus h3 mb-1" />
                                        <span className="arsenal">Damage</span>
                                    </button>
                                </div>
                                <div className="text-center" style={{ width: '80px', height: '80px' }}>
                                    <small className="d-block mb-1 text-secondary">Amount</small>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Math.max(1, parseInt(e.currentTarget.value) || 1))}
                                        className="form-control hp-input text-center bg-dark text-light"
                                        min="1"
                                        style={{ fontSize: '1.5rem', height: '80px' }}
                                    />
                                </div>
                                <div className="d-flex flex-column align-items-center" style={{ width: '80px', height: '80px' }}>

                                    <br />
                                    <div className="btn-group-vertical" style={{ width: '80px' }}>
                                        <button
                                            onClick={handleHeal}
                                            className="btn btn-outline-success"
                                            style={{ width: '80px', height: '40px' }}
                                            title="Heal HP"
                                        >
                                            <div className="d-flex justify-content-between align-content-center arsenal">
                                                <i className="fas fa-heart-circle-plus me-2" />
                                                <small>Heal</small>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleTempHeal}
                                            className="btn btn-outline-info"
                                            style={{ width: '80px', height: '40px' }}
                                            title="Heal Temporary HP"
                                        >
                                            <div className="d-flex justify-content-between align-content-center arsenal">
                                                <i className="fas fa-heart-pulse me-2" />
                                                <small>Temp</small>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mp-section d-flex flex-column align-items-sm-start">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-3 text-secondary-emphasis">MANA POINTS (MP)</h5>
                        </div>

                        <div className="d-flex gap-3 mb-3">
                            <div>
                                <div className="d-flex align-items-end gap-2">
                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">Current</small>
                                        <input
                                            type="number"
                                            value={characterStats.currentMp}
                                            onChange={(e) => updateHealth({
                                                currentMp: Math.max(0, Math.min(characterStats.maxMp, parseInt(e.currentTarget.value) || 0))
                                            })}
                                            className={`form-control form-control-lg hp-input text-center bg-dark text-light ${mpChanged ? 'mp-flash' : ''}`}
                                            min="0"
                                            max={characterStats.maxMp}
                                        />
                                    </div>

                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '10px', height: '80px' }}>
                                        <span className="h4 mb-1 text-secondary">/</span>
                                    </div>

                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">Max</small>
                                        <input
                                            type="number"
                                            value={characterStats.maxMp}
                                            onChange={handleMaxMpChange}
                                            className="form-control form-control-lg hp-input text-center bg-dark text-light"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <div className="text-center" style={{ width: '80px', height: '80px' }}>
                                    <br />
                                    <button
                                        onClick={handleUseMp}
                                        className="btn btn-outline-primary flex-grow-1"
                                        style={{ width: '80px', height: '80px' }}
                                    >
                                        <i className="fas fa-bolt-lightning h3 mb-1" />
                                        <span className="d-block arsenal">Use</span>
                                    </button>
                                </div>
                                <div className="text-center" style={{ width: '80px', height: '80px' }}>
                                    <small className="d-block mb-1 text-secondary">Amount</small>
                                    <input
                                        type="number"
                                        value={mpAmount}
                                        onChange={(e) => setMpAmount(Math.max(1, parseInt(e.currentTarget.value) || 1))}
                                        className="form-control hp-input text-center bg-dark text-light"
                                        min="1"
                                        style={{ fontSize: '1.5rem', height: '100%' }}
                                    />
                                </div>
                                <div className="text-center" style={{ width: '80px', height: '80px' }}>
                                    <br />
                                    <button
                                        onClick={handleRestoreMp}
                                        className="btn btn-outline-info flex-grow-1"
                                        style={{ width: '80px', height: '80px' }}
                                    >
                                        <i className="fas fa-droplet h3 mb-1" />
                                        <span className="d-block arsenal">Restore</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                
                </div>

                <div className="col-lg-4">
                    <div className="conditions-tracker-placeholder p-3 border rounded bg-dark-subtle">
                        <h5 className="text-secondary-emphasis">CONDITIONS TRACKER</h5>
                        <p className="text-muted">(Placeholder for future implementation)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}