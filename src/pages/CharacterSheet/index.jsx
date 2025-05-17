import './style.scss';
import HitPoints from '../../components/HitPoints';
import AffinityTracker from '../../components/AffinityTracker';

export function CharacterSheet() {
    return (
        <div className="character-sheet container-fluid">
            <div className="column">
                <HitPoints />
                <AffinityTracker />
            </div>
        </div>
    );
}