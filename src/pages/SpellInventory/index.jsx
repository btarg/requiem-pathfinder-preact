import SpellManager from '../../components/SpellManager';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import CharacterStats from '../../components/CharacterStats';

export function SpellsAndStats() {
    return (
        <div className="spell-inventory container-fluid p-0">
            <div className="row g-0">
                {/* SpellManager - full width on mobile, 9 columns on desktop */}
                <div className="col-12 col-md-9 order-1 order-md-2" style={{ minHeight: '50vh', overflowY: 'auto' }}>
                    <SpellManager />
                </div>
                {/* Stats - full width on mobile, 3 columns on desktop */}
                <div className="col-12 col-md-3 order-2 order-md-1" style={{ minHeight: '50vh', overflowY: 'auto' }}>
                    <CharacterStats />
                </div>
            </div>
        </div>
    );
}