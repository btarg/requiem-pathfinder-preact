import { AbilityType, ElementType, getElementIcon } from "../../config/enums";

const EditAbilityEntryModal = ({
    isModalOpen,
    closeModal,
    abilityBeingEdited,
    currentAbility,
    setCurrentAbility,
    getActionLabel,
    validateDiceRoll,
    diceError,
    saveAbility,
    removeAbility
}) => {
    return (
        <div className={`modal ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none' }} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{abilityBeingEdited ? "Edit Ability" : "Add Ability"}</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-2">
                            <label className="form-label">Ability Type</label>
                            <div className="btn-group w-100">
                                <button
                                    type="button"
                                    className={`btn ${currentAbility.type === AbilityType.GENERIC ? 'btn-danger' : 'btn-outline-danger'}`}
                                    onClick={() => setCurrentAbility({
                                        ...currentAbility,
                                        type: AbilityType.GENERIC
                                    })}
                                >
                                    Generic Ability
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${currentAbility.type === AbilityType.WEAPON ? 'btn-danger' : 'btn-outline-danger'}`}
                                    onClick={() => setCurrentAbility({
                                        ...currentAbility,
                                        type: AbilityType.WEAPON
                                    })}
                                >
                                    Attack
                                </button>
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={currentAbility.type === AbilityType.WEAPON ? "Attack Name" : "Ability Name"}
                                value={currentAbility.name}
                                onInput={(e) => setCurrentAbility({
                                    ...currentAbility,
                                    name: e.currentTarget.value
                                })}
                            />
                        </div>

                        <label className="form-label">Actions to Use</label>
                        <div className="input-group mb-2">
                            <span className="input-group-text">
                                {getActionLabel(currentAbility.actions)}
                            </span>
                            <select className="form-select" value={currentAbility.actions}
                                onChange={(e) => setCurrentAbility({ ...currentAbility, actions: parseInt(e.currentTarget.value) })}>
                                <option value="1">1 Action</option>
                                <option value="2">2 Actions</option>
                                <option value="3">3 Actions</option>
                                <option value="4">Reaction</option>
                                <option value="0">Free Action</option>
                            </select>
                        </div>

                        <label className="form-label">Element</label>
                        <div className="input-group mb-2">
                            <span className="input-group-text">
                                {getElementIcon(currentAbility.element)}
                            </span>
                            <select
                                className="form-select"
                                value={currentAbility.element}
                                onChange={(e) => setCurrentAbility({
                                    ...currentAbility,
                                    element: e.currentTarget.value
                                })}
                            >
                                {Object.values(ElementType).map(element => (
                                    <option key={element} value={element}>
                                        {element}
                                    </option>
                                ))}
                            </select>
                        </div>

                        
                        <label className="form-label">{currentAbility.type === AbilityType.WEAPON ? 'Attack Roll' : 'Dice Roll'}</label>
                        <div className="input-group mb-2">
                            <span className="input-group-text">
                                <i className="fas fa-dice-d20"></i>
                            </span>
                            <input
                                type="text"
                                className={`form-control ${diceError ? 'is-invalid' : ''}`}
                                placeholder="Dice Roll (e.g. 1d4)"
                                value={currentAbility.dice}
                                onInput={(e) => {
                                    const value = e.currentTarget.value;
                                    setCurrentAbility({ ...currentAbility, dice: value });
                                    validateDiceRoll(value);
                                }}
                            />
                            {diceError && (
                                <div className="invalid-feedback">
                                    {diceError}
                                </div>
                            )}
                        </div>
                        <div className="alert alert-info py-1 mb-2">
                            <i className="fas fa-info-circle me-2"></i>
                            <small>Use [stat] to include a stat's value (e.g., [strength] + 1d6)</small>
                        </div>

                        {currentAbility.type === AbilityType.WEAPON && (
                            <div className="mb-3">
                                <label className="form-label">Additional Attacks</label>
                                <br />
                                {currentAbility.additionalAttacks && currentAbility.additionalAttacks.map((attack, index) => (
                                    <div key={index} className="input-group mb-2">
                                        <span className="input-group-text">Attack {index + 2} Modifier</span>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={attack.penalty}
                                            onChange={(e) => {
                                                const newValue = parseInt(e.currentTarget.value) || 0;
                                                const updatedAttacks = [...currentAbility.additionalAttacks];
                                                updatedAttacks[index] = { ...attack, penalty: newValue };
                                                setCurrentAbility({
                                                    ...currentAbility,
                                                    additionalAttacks: updatedAttacks
                                                });
                                            }}
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-danger" 
                                            onClick={() => {
                                                const updatedAttacks = [...currentAbility.additionalAttacks];
                                                updatedAttacks.splice(index, 1);
                                                setCurrentAbility({
                                                    ...currentAbility,
                                                    additionalAttacks: updatedAttacks
                                                });
                                            }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    className="btn btn-sm btn-outline-secondary" 
                                    onClick={() => {
                                        const updatedAttacks = [...(currentAbility.additionalAttacks || [])];
                                        updatedAttacks.push({ penalty: -5 }); // Default -5 penalty for additional attacks
                                        setCurrentAbility({
                                            ...currentAbility,
                                            additionalAttacks: updatedAttacks
                                        });
                                    }}
                                >
                                    <i className="fas fa-plus me-1"></i> Add Attack
                                </button>
                            </div>
                        )}

                        <div className="mb-2">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" placeholder="Ability Description" value={currentAbility.description}
                                onInput={(e) => setCurrentAbility({ ...currentAbility, description: e.currentTarget.value })} />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            <i className="fas fa-times me-1"></i>Close
                        </button>
                        {abilityBeingEdited && (
                            <button type="button"
                                className="btn btn-danger"
                                onClick={() => removeAbility(abilityBeingEdited.id)}>
                                <i className="fas fa-trash-alt me-1"></i>Delete
                            </button>
                        )}
                        <button type="button" className="btn btn-success" onClick={saveAbility}>
                            <i className={`fas ${abilityBeingEdited ? 'fa-save' : 'fa-plus'} me-1`}></i>
                            {abilityBeingEdited ? "Save Changes" : "Add Ability"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAbilityEntryModal;