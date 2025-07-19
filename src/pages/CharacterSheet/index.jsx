import './style.scss';
import AffinityTracker from '../../components/CharacterSheet/AffinityTracker';
import ConditionsTracker from '../../components/CharacterSheet/ConditionsTracker';
import { getLinkStatBonus } from '../../utils/diceHelpers';
import { useContext } from 'preact/hooks';
import { useSpellContext } from '../../context/SpellContext';
import { CharacterContext } from '../../context/CharacterContext';
import DecorativeTitle from '../../components/DecorativeTitle';
import HitPoints from '../../components/CharacterSheet/HitPoints';
import CharacterOverview from '../../components/CharacterSheet/CharacterOverview';
import { calculateConditionEffects } from '../../config/conditions';

export function CharacterSheet() {

    const { spells } = useSpellContext();
    const { characterStats, setCharacterStats } = useContext(CharacterContext);

    return (
        <div className="character-sheet container-fluid">
            <div className="column">
                {/* Character Overview - Speed, AC, and Max Values */}
                <CharacterOverview />

                {/* Hit Points and Conditions Row */}
                <div className="row justify-content-between mb-4">
                    <div className="col-md-6">
                        <HitPoints />
                    </div>
                    <div className="col-md-6">
                        <ConditionsTracker />
                    </div>
                </div>

                {/* Affinity Tracker Row */}
                <div className="row justify-content-center mt-4">
                    <div className="col-12">
                        <AffinityTracker />
                    </div>
                </div>

            </div>
        </div>
    );
}