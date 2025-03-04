import { useEffect, useState, useContext } from 'preact/hooks'
import { CharacterContext } from '../context/CharacterContext'
import './HitPoints.scss'

export default function HitPoints() {
    const { characterStats, setCharacterStats } = useContext(CharacterContext)
    const [amount, setAmount] = useState(1)
    const [damageTaken, setDamageTaken] = useState(false)
    const [healed, setHealed] = useState(false)
    const [tempDamageTaken, setTempDamageTaken] = useState(false)

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

    // Health management functions
    const updateHealth = (updates) => {
        setCharacterStats(prev => ({
            ...prev,
            ...updates
        }))
    }

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

    const handleMaxHealthChange = (e) => {
        const newMax = Math.max(1, parseInt(e.currentTarget.value) || 1)
        updateHealth({ maxHealth: newMax })
        if (characterStats.currentHealth > newMax) {
            updateHealth({ currentHealth: newMax })
        }
    }

    const healthPercentage = (characterStats.currentHealth / characterStats.maxHealth) * 100
    const tempHealthPercentage = (characterStats.tempHealth / characterStats.maxHealth) * 100
    const totalHealth = characterStats.currentHealth + characterStats.tempHealth


    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0 text-secondary-emphasis">HIT POINTS</h5>
            </div>

            <div className="d-flex gap-4 mb-3">
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
                                className={`form-control hp-input text-center bg-dark text-light ${tempDamageTaken ? 'damage-flash' : ''}`}
                                min="0"
                                style={{ fontSize: '1.5rem', height: '80px' }}
                            />
                        </div>

                        <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '80px' }}>
                            <span className="h4 m-0 text-secondary">+</span>
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

                        <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '80px' }}>
                            <span className="h4 m-0 text-secondary">/</span>
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
                {/* These should appear below the other controls */}
                <div className="d-flex gap-2">
                    <div className="text-center" style={{ width: '80px', height: '80px' }}>
                        <br />
                        <button
                            onClick={handleDamage}
                            className="btn btn-outline-danger flex-grow-1"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="fas fa-heart-circle-minus h3 mb-1" />
                            <small className="d-block">Damage</small>
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
                            style={{ fontSize: '1.5rem', height: '100%' }}
                        />
                    </div>
                    <div className="text-center" style={{ width: '80px', height: '80px' }}>
                        <br />
                        <button
                            onClick={handleHeal}
                            className="btn btn-outline-success flex-grow-1"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="fas fa-heart-circle-plus h3 mb-1" />
                            <small className="d-block">Heal</small>
                        </button>
                    </div>
                </div>

            </div>
            {/* Health bar */}
            <div className="progress mt-2">
                <div
                    className="progress-bar progress-bar-striped bg-info"
                    style={{
                        width: `${tempHealthPercentage}%`,
                        transition: 'width 0.3s ease-in-out'
                    }}
                    role="progressbar"
                    aria-valuenow={characterStats.tempHealth}
                    aria-valuemin={0}
                    aria-valuemax={characterStats.maxHealth}
                >
                </div>
                <div
                    className="progress-bar bg-success"
                    style={{
                        width: `${healthPercentage}%`,
                        transition: 'width 0.3s ease-in-out'
                    }}
                    role="progressbar"
                    aria-valuenow={characterStats.currentHealth}
                    aria-valuemin={0}
                    aria-valuemax={characterStats.maxHealth}
                >
                </div>
            </div>
        </div>
    )
}