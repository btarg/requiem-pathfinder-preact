import DecorativeTitle from './DecorativeTitle.jsx';
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
                    <DecorativeTitle title="NAVIGATION" containerClassName='mb-3 arsenal' />
                    <nav className="btn-group gap-2" role="group" aria-label="Main navigation">
                        <button
                            className={`dark-btn dark-btn-primary ${url === characterSheetPath ? 'dark-btn-active' : ''}`}
                            onClick={() => window.location.href = characterSheetPath}
                            data-bs-toggle="tooltip"
                            style={{ padding: "12px 35px" }}
                        >
                            <span>Character Sheet</span>
                        </button>
                        <button
                            className={`dark-btn dark-btn-primary ${url === spellsPath ? 'dark-btn-active' : ''}`}
                            onClick={() => window.location.href = spellsPath}
                            data-bs-toggle="tooltip"
                            style={{ padding: "12px 35px" }}
                        >
                            <span>Spells</span>
                        </button>
                    </nav>

                </div>
            </div>
        </header>
    );
}