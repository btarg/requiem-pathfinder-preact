import { ElementType } from "../../config/enums"

const EditSpellEntryModal = ({
    isModalOpen,
    closeModal,
    spellBeingEdited,
    currentSpell,
    setCurrentSpell,
    incrementPower,
    decrementPower,
    getSpellRank,
    getActionLabel,
    validateDiceRoll,
    diceError,
    saveSpell,
    removeSpell
}) => {
    return (
        <div className={`modal ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none' }} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{spellBeingEdited ? "Edit Spell Entry" : "Add Spell"}</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-2">
                            <label className="form-label">Spell Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Spell Name"
                                value={currentSpell.name}
                                onInput={(e) => setCurrentSpell({
                                    ...currentSpell,
                                    name: e.currentTarget.value
                                })}
                            />
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Spell Level</label>
                            <div className="input-group">
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={decrementPower}
                                    disabled={currentSpell.power <= 1}
                                >
                                    <i className="fas fa-minus"></i>
                                </button>
                                <input
                                    type="number"
                                    className={`form-control ${currentSpell.power <= 0 ? 'is-invalid' : ''}`}
                                    placeholder="Spell Level"
                                    min="1"
                                    value={currentSpell.power}
                                    onInput={(e) => {
                                        const value = Math.max(1, parseInt(e.currentTarget.value, 10) || 1);
                                        setCurrentSpell({
                                            ...currentSpell,
                                            power: value,
                                            rank: getSpellRank(value)
                                        });
                                    }}
                                />
                                <button className="btn btn-outline-secondary" type="button"
                                    onClick={incrementPower}>
                                    <i className="fas fa-plus"></i>
                                </button>
                                {currentSpell.power <= 0 && (
                                    <div className="invalid-feedback">
                                        Spell level must be at least 1
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="alert alert-info py-1 mb-2">
                            <i className="fas fa-link me-2"></i>
                            <small className="text-muted d-block mt-1">
                                This spell's <a href="https://docs.google.com/document/d/1ZTxCemR8j6GhIMqhvmBd7kOo8wNsOisO_vOutlQBYv0/edit?tab=t.0" target="_blank">Soul Link Rank</a> will be <b>{getSpellRank(currentSpell.power)}.</b>
                            </small>
                        </div>

                        <label className="form-label">Actions to Cast</label>
                        <div className="input-group mb-2">
                            <span className="input-group-text">
                                {getActionLabel(currentSpell.actions)}
                            </span>
                            <select className="form-select" value={currentSpell.actions}
                                onChange={(e) => setCurrentSpell({ ...currentSpell, actions: parseInt(e.currentTarget.value) })}>
                                <option value="1">1 Action</option>
                                <option value="2">2 Actions</option>
                                <option value="3">3 Actions</option>
                                <option value="0">Free Action</option>
                            </select>
                        </div>

                        <label className="form-label">Spell Affinity</label>
                        <div className="input-group mb-2">
                            <span className="input-group-text">
                                <i className="fas fa-magic"></i>
                            </span>
                            <select
                                className="form-select"
                                value={currentSpell.element}
                                onChange={(e) => setCurrentSpell({
                                    ...currentSpell,
                                    element: e.currentTarget.value
                                })}
                            >
                                {Object.entries(ElementType).map(([key, value]) => (
                                    <option key={value} value={value}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                        </div>

                        
                        <label className="form-label">Damage Roll(s)</label>
                        <div className="input-group mb-2">
                            <span className="input-group-text">
                                <i className="fas fa-dice-d20"></i>
                            </span>
                            <input
                                type="text"
                                className={`form-control ${diceError ? 'is-invalid' : ''}`}
                                placeholder="Dice Roll (e.g. 1d4)"
                                value={currentSpell.dice}
                                onInput={(e) => {
                                    const value = e.currentTarget.value;
                                    setCurrentSpell({ ...currentSpell, dice: value });
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

                        <div className="mb-2">
                            <label className="form-label">Spell Description</label>
                            <textarea className="form-control" placeholder="Spell Description" value={currentSpell.description}
                                onInput={(e) => setCurrentSpell({ ...currentSpell, description: e.currentTarget.value })} />
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Amount currently stocked <i>("Spell Charges")</i></label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className={`form-control ${currentSpell.quantity < 0 || currentSpell.quantity > 100 ? 'is-invalid' : ''}`}
                                    placeholder="Quantity"
                                    min="0"
                                    max="100"
                                    value={currentSpell.quantity}
                                    onInput={(e) => {
                                        const value = parseInt(e.currentTarget.value, 10) || 0;
                                        if (value > 100) {
                                            setCurrentSpell({ ...currentSpell, quantity: 100 });
                                        } else {
                                            setCurrentSpell({ ...currentSpell, quantity: Math.max(0, value) });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            <i className="fas fa-times me-1"></i>Close
                        </button>
                        {spellBeingEdited && (
                            <button type="button"
                                className="btn btn-danger"
                                onClick={() => removeSpell(spellBeingEdited.id)}>
                                <i className="fas fa-trash-alt me-1"></i>Delete
                            </button>
                        )}
                        <button type="button" className="btn btn-success" onClick={saveSpell}>
                            <i className={`fas ${spellBeingEdited ? 'fa-save' : 'fa-plus'} me-1`}></i>
                            {spellBeingEdited ? "Save Changes" : "Add Spell"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSpellEntryModal;