import { h } from 'preact';

const DeleteAbilityModal = ({ abilityToDelete, confirmDelete, setAbilityToDelete }) => {
    return (
        <div className={`modal fade ${abilityToDelete ? 'show' : ''}`} style={{ display: abilityToDelete ? 'block' : 'none' }} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confirm Deletion</h5>
                        <button type="button" className="btn-close" onClick={() => setAbilityToDelete(null)} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        Are you sure you want to delete this ability?
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setAbilityToDelete(null)}>
                            No, Keep It
                        </button>
                        <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                            Yes, Delete It
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAbilityModal;
