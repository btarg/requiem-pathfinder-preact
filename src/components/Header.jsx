import { useEffect } from 'preact/hooks';
import DecorativeTitle from './DecorativeTitle.jsx';
import { BASE_URL } from '../config/constants.js';
import { useLocation } from 'preact-iso'; // Import route for navigation

import LeftArrowIcon from '../assets/keyboard_arrow_left_outline.svg';
import RightArrowIcon from '../assets/keyboard_arrow_right_outline.svg';

import './Header.scss';

const pageRoutes = [
    { id: 'character', title: 'Health' },
    { id: 'spells', title: 'Spells and Stats' },
    { id: 'abilities', title: 'Abilities' },
];

const pages = pageRoutes.map(page => ({
    title: page.title,
    path: page.id === 'character'
        ? BASE_URL
        : `${BASE_URL.replace(/\/$/, '')}/${page.id}`
}));

export function Header() {
    const { url, route } = useLocation();

    const currentPageIndex = pages.findIndex(page => page.path === url);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check if the event target is an input, textarea, or contenteditable element
            const targetTagName = event.target.tagName.toLowerCase();
            const isContentEditable = event.target.isContentEditable;

            if (targetTagName === 'input' || targetTagName === 'textarea' || isContentEditable) {
                // If focused on an input, textarea, or contenteditable, do not navigate
                return;
            }

            if (event.key === 'ArrowLeft') {
                if (currentPageIndex > 0) {
                    route(pages[currentPageIndex - 1].path);
                }
            } else if (event.key === 'ArrowRight') {
                if (currentPageIndex < pages.length - 1) {
                    route(pages[currentPageIndex + 1].path);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [url, currentPageIndex]);

    const iconStyle = {
        height: '48px',
        verticalAlign: 'middle',
        cursor: 'pointer',
    };

    const navigateTo = (path) => {
        route(path);
    };

    return (
        <header className="header mb-4">
            <div className="d-flex justify-content-center align-items-center p-3 border-bottom">
                <div className="col-md-8 col-lg-6 text-center">
                    {/* <DecorativeTitle title="NAVIGATION" containerClassName='mb-3' /> */}
                    <nav className="btn-group gap-2" role="group" aria-label="Main navigation">
                        <img
                            src={LeftArrowIcon}
                            alt="Navigate left"
                            onClick={() => currentPageIndex > 0 && navigateTo(pages[currentPageIndex - 1].path)}
                            style={{
                                ...iconStyle,
                                marginRight: '8px',
                                filter: currentPageIndex > 0 ? 'opacity(0.75)' : 'opacity(0.3)',
                                cursor: currentPageIndex > 0 ? 'pointer' : '',
                            }}
                            aria-disabled={currentPageIndex <= 0}
                        />                        {pages.map((page, index) => {
                            let buttonClasses = `dark-btn dark-btn-secondary`; // Base classes
                            if (url === page.path) {
                                buttonClasses += ' dark-btn--active';
                            }
                            return (
                                <button
                                    key={page.path}
                                    className={buttonClasses}
                                    onClick={() => navigateTo(page.path)}
                                >
                                    <span>{page.title}</span>
                                </button>
                            );
                        })}
                        <img
                            src={RightArrowIcon}
                            alt="Navigate right"
                            onClick={() => currentPageIndex < pages.length - 1 && navigateTo(pages[currentPageIndex + 1].path)}
                            style={{
                                ...iconStyle,
                                marginLeft: '8px',
                                filter: currentPageIndex < pages.length - 1 ? 'opacity(0.75)' : 'opacity(0.3)',
                                cursor: currentPageIndex < pages.length - 1 ? 'pointer' : '',
                            }}
                            aria-disabled={currentPageIndex >= pages.length - 1}
                        />
                    </nav>
                </div>
            </div>
        </header>
    );
}