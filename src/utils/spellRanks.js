// * Spells in Pathfinder have Levels, which correspond to Soul Link Ranks.
//    * Rank 1: Cantrips & Level 1 Spells
//     * Rank 2: Level 2–3 Spells
//         * Rank 3: Level 4–5 Spells
//             * Rank 4: Level 6–7 Spells
//                 * Rank 5: Level 8–10 Spells

export const get_spell_rank = (spell_level) => {
    if (spell_level <= 1) return 1;
    if (spell_level <= 3) return 2;
    if (spell_level <= 5) return 3;
    if (spell_level <= 7) return 4;
    return 5;
}