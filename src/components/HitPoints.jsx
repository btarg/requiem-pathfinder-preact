import { useEffect, useState } from 'preact/hooks'

export default function HitPoints() {
    // const [currentHealth, setCurrentHealth] = useState(62)
    // const [maxHealth, setMaxHealth] = useState(70)
    // const [tempHealth, setTempHealth] = useState(0)
    const [amount, setAmount] = useState(1)
    const [damageTaken, setDamageTaken] = useState(false)
    const [healed, setHealed] = useState(false)
    const [tempDamageTaken, setTempDamageTaken] = useState(false)

    const [currentHealth, setCurrentHealth] = useState(() => {
        const saved = localStorage.getItem('currentHealth')
        return saved ? parseInt(saved) : 62
    })
    const [maxHealth, setMaxHealth] = useState(() => {
        const saved = localStorage.getItem('maxHealth')
        return saved ? parseInt(saved) : 70
    })
    const [tempHealth, setTempHealth] = useState(() => {
        const saved = localStorage.getItem('tempHealth')
        return saved ? parseInt(saved) : 0
    })

    useEffect(() => {
        if (currentHealth > maxHealth) {
            setCurrentHealth(maxHealth)
        }
    }, [maxHealth])

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
        localStorage.setItem('currentHealth', currentHealth.toString())
    }, [currentHealth])

    useEffect(() => {
        localStorage.setItem('maxHealth', maxHealth.toString())
    }, [maxHealth])

    useEffect(() => {
        localStorage.setItem('tempHealth', tempHealth.toString())
    }, [tempHealth])

    const handleReset = () => {
        localStorage.removeItem('currentHealth')
        localStorage.removeItem('maxHealth')
        localStorage.removeItem('tempHealth')
        setCurrentHealth(62)
        setMaxHealth(70)
        setTempHealth(0)
    }

    const handleDamage = () => {
        if (tempHealth > 0) {
            setTempDamageTaken(true)
            const remainingDamage = amount - tempHealth
            setTempHealth(Math.max(0, tempHealth - amount))
            if (remainingDamage > 0) {
                setDamageTaken(true)
                setCurrentHealth(Math.max(0, currentHealth - remainingDamage))
            }
        } else {
            setDamageTaken(true)
            setCurrentHealth(Math.max(0, currentHealth - amount))
        }
        setAmount(1)
    }

    const handleHeal = () => {
        setHealed(true)
        setCurrentHealth(Math.min(maxHealth, currentHealth + amount))
        setAmount(1)
    }

    const handleMaxHealthChange = (e) => {
        const newMax = Math.max(1, parseInt(e.currentTarget.value) || 1)
        setMaxHealth(newMax)
        if (currentHealth > newMax) {
            setCurrentHealth(newMax)
        }
    }

    const handleCurrentHealthChange = (e) => {
        const newCurrent = Math.max(0, Math.min(maxHealth, parseInt(e.currentTarget.value) || 0))
        setCurrentHealth(newCurrent)
    }

    const healthPercentage = (currentHealth / maxHealth) * 100
    const tempHealthPercentage = (tempHealth / maxHealth) * 100

    return (
        <div className="bg-dark text-light p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0 text-secondary-emphasis">HIT POINTS</h5>
            </div>

            <div className="d-flex gap-4 mb-3">
                {/* Health values group */}
                <div>
                    <div className="d-flex align-items-end gap-2">
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Temp</small>
                            <input
                                type="number"
                                value={tempHealth}
                                onChange={(e) => setTempHealth(Math.max(0, parseInt(e.currentTarget.value) || 0))}
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
                                value={currentHealth}
                                onChange={handleCurrentHealthChange}
                                className={`form-control form-control-lg hp-input text-center bg-dark
                                    ${damageTaken ? 'damage-flash' : ''}
                                    ${healed ? 'heal-flash' : ''}
                                    ${tempDamageTaken ? 'temp-flash' : ''}`}
                                min="0"
                                max={maxHealth}
                            />
                        </div>

                        <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '80px' }}>
                            <span className="h4 m-0 text-secondary">/</span>
                        </div>

                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Max</small>
                            <input
                                type="number"
                                value={maxHealth}
                                onChange={handleMaxHealthChange}
                                className="form-control form-control-lg hp-input text-center bg-dark"
                                min="1"
                            />
                        </div>
                    </div>
                    <div className="progress mt-2" style={{ height: '8px' }}>
                        <div
                            className="progress-bar bg-info"
                            style={`width: ${tempHealthPercentage}%`}
                            role="progressbar"
                            aria-valuenow={tempHealth}
                            aria-valuemin={0}
                            aria-valuemax={maxHealth}
                        ></div>
                        <div
                            className="progress-bar bg-success"
                            style={`width: ${healthPercentage}%`}
                            role="progressbar"
                            aria-valuenow={currentHealth}
                            aria-valuemin={0}
                            aria-valuemax={maxHealth}
                        ></div>
                    </div>
                </div>

                {/* Controls group */}
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
        </div>
        
    )
}