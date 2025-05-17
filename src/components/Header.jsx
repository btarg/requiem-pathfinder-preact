import DecorativeTitle from './DecorativeTitle.jsx';
import QuickRolls from './QuickRolls.jsx';
import { BASE_URL } from '../config/constants.js';
import { useLocation } from 'preact-iso';

export function Header() {

    const { url } = useLocation();
    const characterSheetPath = BASE_URL;
    const spellsPath = BASE_URL === '/' ? '/spells' : `${BASE_URL.replace(/\/$/, '')}/spells`;

    return (
        <header className="header mb-4">
            <div className="d-flex justify-content-center align-items-center p-3 border-bottom">
                <div className="col-4 text-center">
                    <DecorativeTitle title="NAVIGATION" containerClassName='mb-3' />
                    <nav className="btn-group" role="group" aria-label="Main navigation">
                        <a
                            className={`btn ${url === characterSheetPath ? 'dark-btn-secondary' : 'dark-btn'}`}
                            href={characterSheetPath}
                        >
                            Character Sheet
                        </a>
                        <a
                            className={`btn ${url === spellsPath ? 'dark-btn-secondary' : 'dark-btn'}`}
                            href={spellsPath}
                        >
                            Spell Inventory
                        </a>
                    </nav>

                </div>
            </div>
        </header>
    );
}