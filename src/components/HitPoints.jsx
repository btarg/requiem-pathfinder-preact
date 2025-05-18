import { useEffect, useState, useContext } from 'preact/hooks'
import { CharacterContext } from '../context/CharacterContext'
import './HitPoints.scss'
import DecorativeTitle from './DecorativeTitle'

export default function HitPoints() {
    const { characterStats, setCharacterStats } = useContext(CharacterContext)
    const [amount, setAmount] = useState(1)
    const [mpAmount, setMpAmount] = useState(1)
    const [damageTaken, setDamageTaken] = useState(false)
    const [healed, setHealed] = useState(false)
    const [tempDamageTaken, setTempDamageTaken] = useState(false)
    const [mpChanged, setMpChanged] = useState(false)
    const [tempHealed, setTempHealed] = useState(false) // ADDED: State for temp heal animation

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

    // ADDED: useEffect for tempHealed animation
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
        if (characterStats.tempHealth > 0) {
            setTempDamageTaken(true)
            const remainingDamage = amount - characterStats.tempHealth
            updateHealth({
                tempHealth: Math.max(0, characterStats.tempHealth - amount)
            })
            if (remainingDamage > 0) {
                setDamageTaken(true)
                updateHealth({
                    currentHealth: Math.max(0, characterStats.currentHealth - remainingDamage)
                })
            }
        } else {
            setDamageTaken(true)
            updateHealth({
                currentHealth: Math.max(0, characterStats.currentHealth - amount)
            })
        }
        setAmount(1)
    }

    const handleHeal = () => {
        setHealed(true)
        updateHealth({
            currentHealth: Math.min(characterStats.maxHealth, characterStats.currentHealth + amount)
        })
        setAmount(1)
    }

    // ADDED: Function to handle temporary healing
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
    // Ensure maxHealth is at least 1 for division, defaulting to 0 if undefined then taking max with 1.
    const safeMaxHealth = Math.max(1, characterStats.maxHealth || 0);
    const safeTempHealth = characterStats.tempHealth || 0;

    const healthPercentage = (safeCurrentHealth / safeMaxHealth) * 100;
    const tempHealthPercentage = (safeTempHealth / safeMaxHealth) * 100;

    // Ensure mp values are also safe for calculation, though useEffect handles initialization.
    const safeCurrentMp = characterStats.currentMp || 0;
    const safeMaxMp = Math.max(1, characterStats.maxMp || 0);
    const mpPercentage = (safeCurrentMp / safeMaxMp) * 100;

    return (
        <div className="mt-4 mb-4">
            <div className="row justify-content-between align-items-start px-3">
                {/* Left Column for HP, MP, and Health Bar */}
                <div className="col-lg-8">
                    {/* HP Section */}
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
                                            className={`form-control hp-input text-center bg-dark text-light ${tempDamageTaken ? 'damage-flash' : ''} ${tempHealed ? 'temp-flash' : ''}`} // ADDED: tempHealed for animation
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
                                        style={{ fontSize: '1.5rem', height: '80px' }} // Adjusted height to match buttons
                                    />
                                </div>
                                {/* Heal buttons */}
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
                    {/* End HP Section */}

                    {/* MP Section */}
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
                    {/* End MP Section */}

                    {/* Health Bar Section - Spanning the width of the left column */}
                    <div className="row justify-content-center px-0 mb-1"> {/* px-0 to use full width of parent col */}
                        <div className="col-12">
                            <div className="progress" style={{ height: '16px' }}>
                                <div
                                    className="progress-bar progress-bar-striped bg-info"
                                    style={{
                                        width: `${tempHealthPercentage}%`,
                                        transition: 'width 0.3s ease-in-out'
                                    }}
                                    role="progressbar"
                                    aria-valuenow={safeTempHealth}
                                    aria-valuemin={0}
                                    aria-valuemax={safeMaxHealth}
                                >
                                    {safeTempHealth > 0 ? `${safeTempHealth} Temp` : ''}
                                </div>
                                <div
                                    className="progress-bar bg-success"
                                    style={{
                                        width: `${healthPercentage}%`,
                                        transition: 'width 0.3s ease-in-out'
                                    }}
                                    role="progressbar"
                                    aria-valuenow={safeCurrentHealth}
                                    aria-valuemin={0}
                                    aria-valuemax={safeMaxHealth}
                                >
                                    {safeCurrentHealth > 0 ? `${safeCurrentHealth} HP` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* End Health Bar Section */}
                </div>
                {/* End Left Column */}

                {/* Right Column for Conditions Tracker */}
                <div className="col-lg-4">
                    <div className="conditions-tracker-placeholder p-3 border rounded bg-dark-subtle">
                        <h5 className="text-secondary-emphasis">CONDITIONS TRACKER</h5>
                        <p className="text-muted">(Placeholder for future implementation)</p>
                        {/* Future content for conditions will go here */}
                    </div>
                </div>
                {/* End Right Column */}
            </div>
        </div >
    );
}