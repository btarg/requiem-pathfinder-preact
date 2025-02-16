import { h } from 'preact';

const DeleteSpellModal = ({ spellToDelete, confirmDelete, setSpellToDelete }) => {
    return (
        <div className={`modal fade ${spellToDelete ? 'show' : ''}`} style={{ display: spellToDelete ? 'block' : 'none' }} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confirm Deletion</h5>
                        <button type="button" className="btn-close" onClick={() => setSpellToDelete(null)} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        Are you sure you want to delete this spell?
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setSpellToDelete(null)}>
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

export default DeleteSpellModal;