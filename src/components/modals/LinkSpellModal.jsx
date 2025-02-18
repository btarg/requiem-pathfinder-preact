import { STATS_CONFIG } from "../../config/stats";
import { STAT_TYPES } from "../../types/statTypes";

const LinkSpellModal = ({
    isLinkModalOpen,
    closeLinkModal,
    currentSpell,
    setCurrentSpell,
    saveSpell,
    getLinkedStats
}) => {
    if (!currentSpell) {
        return null;
    }

    return (
        <div className={`modal fade ${isLinkModalOpen ? 'show' : ''}`} style={{ display: isLinkModalOpen ? 'block' : 'none' }} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Link spell to stat</h5>
                        <button type="button" className="btn-close" onClick={closeLinkModal} aria-label="Close"></button>
                    </div>

                    <label className="form-label">Linked Stat</label>
                    <div className="input-group mb-2">
                        <span className="input-group-text">
                            <i className="fas fa-link"></i>
                        </span>
                        <select
                            className="form-select"
                            value={currentSpell.linkedStat}
                            onChange={(e) => setCurrentSpell({
                                ...currentSpell,
                                linkedStat: e.currentTarget.value,
                                isLinked: e.currentTarget.value !== "None"
                            })}
                        >
                            <option value="None">None</option>
                            {Object.entries(STATS_CONFIG).map(([statKey, config]) => (
                                (!getLinkedStats().includes(statKey) || statKey === currentSpell.linkedStat) && config.type != STAT_TYPES.CORE ? (
                                    <option key={statKey} value={statKey}>
                                        {config.name}
                                    </option>
                                ) : null
                            ))}
                        </select>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeLinkModal}>
                            <i className="fas fa-times me-1"></i>Close
                        </button>
                        <button type="button" className="btn btn-success" onClick={saveSpell}>
                            <i className={`fas ${currentSpell ? 'fa-save' : 'fa-plus'} me-1`}></i>
                            {currentSpell ? "Save Changes" : "Add Spell"}
                        </button>
                    </div>
                
                </div>
            </div>
        </div>
    );
};

export default LinkSpellModal;