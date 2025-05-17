import { useLocation } from 'preact-iso';
import { BASE_URL } from '../config/constants.js';
import QuickRolls from './QuickRolls.jsx';

export function Header() {
    const { url } = useLocation();

    const characterSheetPath = BASE_URL;
    // Ensure spells path doesn't have double slashes if BASE_URL is '/'
    // and correctly appends if BASE_URL is a subpath like '/app/'
    const spellsPath = BASE_URL === '/' ? '/spells' : `${BASE_URL.replace(/\/$/, '')}/spells`;

    return (
        <header className="header mb-4">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h3 className="m-0 text-light">Requiem Pathfinder</h3>
                <QuickRolls />
                {/* Make the nav (btn-group) stretch vertically */}
                <nav className="btn-group align-self-stretch" role="group" aria-label="Main navigation">
                    {/* Make buttons take full height and center their text */}
                    <a
                        className={`btn h-100 d-flex align-items-center justify-content-center ${url === characterSheetPath ? 'dark-btn-secondary' : 'dark-btn'}`}
                        href={characterSheetPath}
                    >
                        Character Sheet
                    </a>
                    <a
                        className={`btn h-100 d-flex align-items-center justify-content-center ${url === spellsPath ? 'dark-btn-secondary' : 'dark-btn'}`}
                        href={spellsPath}
                    >
                        Spell Inventory
                    </a>
                </nav>
            </div>
        </header>
    );
}