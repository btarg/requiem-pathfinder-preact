import './style.scss';
import HitPoints from '../../components/HitPoints';
import QuickRolls from '../../components/QuickRolls';
import AffinityTracker from '../../components/AffinityTracker';

export function CharacterSheet() {
    return (
        <div className="character-sheet container-fluid">
            <div className="row g-0">
                <HitPoints />
                <QuickRolls />
                <AffinityTracker />
            </div>
        </div>
    );
}