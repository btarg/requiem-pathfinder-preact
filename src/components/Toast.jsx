import { useEffect } from 'preact/hooks';

const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    return (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div className={`toast show`} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                    <i className="fas fa-info-circle me-2 text-primary"></i>
                    <strong className="me-auto">Spell Update</strong>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <div className="toast-body">
                    {message}
                </div>
            </div>
        </div>
    );
};

export default Toast;