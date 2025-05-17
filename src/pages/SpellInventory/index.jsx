import SpellManager from '../../components/SpellManager';
import './style.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import CharacterStats from '../../components/CharacterStats';
import HitPoints from '../../components/HitPoints';
import QuickRolls from '../../components/QuickRolls';
import AffinityTracker from '../../components/AffinityTracker';

export function SpellsAndStats() {
    return (
        <div className="spell-inventory container-fluid">
            <div className="row g-0">
                <QuickRolls />
                <HitPoints />
                <AffinityTracker />
                
                              
                {/* SpellManager - full width on mobile, 9 columns on desktop */}
                <div className="col-12 col-md-8 order-1 order-md-2" style={{ minHeight: '50vh', overflowY: 'auto' }}>
                    <SpellManager />
                </div>
                {/* Stats - full width on mobile, 3 columns on desktop */}
                <div className="col-12 col-md-4 order-2 order-md-1" style={{ minHeight: '50vh', overflowY: 'auto' }}>
                    <CharacterStats />
                </div>
            </div>
        </div>
    );
}