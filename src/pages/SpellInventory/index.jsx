import CharacterStats from '../../components/CharacterSheet/CharacterStats';
import SpellManager from '../../components/SpellManager';
import './style.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
export function SpellsPage() {
    return (
        <div className="spell-inventory container-fluid">
            <div className="row">
                {/* Stats - full width on mobile, 4 columns on desktop */}
                <div className="col-12 col-md-4 order-2 order-md-1" style={{ minHeight: '50vh', overflowY: 'auto' }}>
                    <CharacterStats />
                </div>
                {/* SpellManager - full width on mobile, 8 columns on desktop */}
                <div className="col-12 col-md-8 order-1 order-md-2" style={{ minHeight: '50vh', overflowY: 'auto' }}>
                    <SpellManager />
                </div>
            </div>
        </div>
    );
}