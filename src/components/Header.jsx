import { useLocation } from 'preact-iso';
import { BASE_URL } from '../config/constants.js';
import QuickRolls from './QuickRolls.jsx';

export function Header() {
    const { url } = useLocation();

    return (
        <header className="header mb-4">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h3 className="m-0 text-light">Requiem Pathfinder</h3>
                <QuickRolls />
                <nav className="btn-group" role="group" aria-label="Main navigation">
                    <a className={`btn ${url === BASE_URL ? 'dark-btn-primary' : 'dark-btn'}`} href={`${BASE_URL}`}>Character Sheet</a>
                    <a className={`btn ${url === `${BASE_URL}spells` ? 'dark-btn-primary' : 'dark-btn'}`} href={`${BASE_URL}spells`}>Spell Inventory</a>
                </nav>
            </div>
        </header>
    );
}
