import { useState, useEffect } from "preact/hooks";
import { Toast } from 'bootstrap';

const ToastManager = () => {
    const [toastContainer, setToastContainer] = useState(null);

    useEffect(() => {
        setToastContainer(document.createElement('div'));
    }, []);

    useEffect(() => {
        if (toastContainer) {
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
            return () => {
                document.body.removeChild(toastContainer);
            };
        }
    }, [toastContainer]);

    const showToast = (message, icon = 'info-circle', type = 'primary', title = 'Notification') => {
        if (!toastContainer) return;

        const toastElement = document.createElement('div');
        toastElement.className = 'toast';
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');

        toastElement.innerHTML = `
            <div class="toast-header">
                <i class="fas fa-${icon} me-2 text-${type}"></i>
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        toastContainer.appendChild(toastElement);
        const toast = new Toast(toastElement, {
            autohide: true,
            delay: 3000
        });

        toast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastContainer.removeChild(toastElement);
        });
    };

    return { showToast };
};

export default ToastManager;