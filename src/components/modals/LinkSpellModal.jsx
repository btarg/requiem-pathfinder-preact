import { STATS_CONFIG } from "../../config/stats";
import { useSpellContext } from "../../context/SpellContext";
import { STAT_TYPES } from "../../types/statTypes";
import { calculateStatBonus, getLinkStatBonus } from "../../utils/diceHelpers";

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

    const { spells } = useSpellContext();
    return (
        <div className={`modal fade ${isLinkModalOpen ? 'show' : ''}`} style={{ display: isLinkModalOpen ? 'block' : 'none' }} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{`Link ${currentSpell.name} to stat`}</h5>
                        <button type="button" className="btn-close" onClick={closeLinkModal} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="input-group mb-2">
                            <span className="input-group-text gap-1">
                                <i className={`fas ${currentSpell.linkedStat && currentSpell.linkedStat !== "None" ? (STATS_CONFIG[currentSpell.linkedStat]?.icon || 'fa-link-slash') : 'fa-link-slash'}`}></i>
                            </span>
                            <select
                                className="form-select"
                                value={currentSpell.linkedStat || "None"} // Ensure "None" is selected if linkedStat is null/undefined
                                onChange={(e) => setCurrentSpell({
                                    ...currentSpell,
                                    linkedStat: e.currentTarget.value === "None" ? null : e.currentTarget.value,
                                    isLinked: e.currentTarget.value !== "None"
                                })}
                            >
                                <option value="None">None</option>
                                {Object.entries(STATS_CONFIG).map(([statKey, config]) => (
                                    (!getLinkedStats().includes(statKey) || statKey === currentSpell.linkedStat) && config.type !== STAT_TYPES.CORE ? (
                                        <option key={statKey} value={statKey}>
                                            {config.name}
                                        </option>
                                    ) : null
                                ))}
                            </select>
                            <span className="input-group-text">
                                {/* Why am i recalculating this? who cares lol */}
                                +{calculateStatBonus(currentSpell.quantity, currentSpell.rank)}
                            </span>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeLinkModal}>
                            <i className="fas fa-times me-1"></i>Close
                        </button>
                        <button type="button" className="btn btn-success" onClick={saveSpell}>
                            <i className={`fas ${currentSpell.id ? 'fa-save' : 'fa-plus'} me-1`}></i> {/* Assuming new spells might not have an id yet */}
                            {currentSpell.id ? "Save Changes" : "Add Spell"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkSpellModal;