
import { Helpers } from '../helpers';
import DeviceData = Shadowrun.DeviceData;
import { SR5Item } from './SR5Item';
import AmmoData = Shadowrun.AmmoData;
import { SR5 } from "../config";
import { Translation } from '../utils/strings';

/**
 * ChatData returns little info boxes for each item type.
 * These are shown for items in actor item lists when looking at their description and within 
 * chat description messages of items.
 * 
 * NOTE: This here is hard to read, requires per item type handling and is not very flexible.
 *       This should be refactored into are more readable approach.
 * 
 * These info boxes will be shown in a few places, most notibly the chat message but also
 * - actor sheets
 */
export const ChatData = {
    call_in_action: (system: Shadowrun.CallInActionData, labels, props) => {
        switch (system.actor_type) {
            case 'sprite':
                if (system.sprite.type) props.push(`${game.i18n.localize("SR5.Compilation.SpriteType")} ${game.i18n.localize(SR5.spriteTypes[system.sprite.type])}`);
                if (system.sprite.level) props.push(`${game.i18n.localize('SR5.Level')} ${system.sprite.level}`);
                return;
            case 'spirit':
                if (system.spirit.type) props.push(`${game.i18n.localize("SR5.Summoning.SpiritType")} ${game.i18n.localize(SR5.spiritTypes[system.spirit.type])}`);
                if (system.spirit.force) props.push(`${game.i18n.localize('SR5.Force')} ${system.spirit.force}`);
                return;
        }
    },
    action: (system, labels, props) => {
        if (system.action) {
            const labelStringList: string[] = [];
            if (system.action.skill) {
                labelStringList.push(Helpers.label(system.action.skill));
                labelStringList.push(Helpers.label(system.action.attribute));
            } else if (system.action.attribute2) {
                labelStringList.push(Helpers.label(system.action.attribute));
                labelStringList.push(Helpers.label(system.action.attribute2));
            } else if (system.action.attribute) {
                labelStringList.push(Helpers.label(system.action.attribute));
            }
            if (system.action.mod) {
                labelStringList.push(`${game.i18n.localize('SR5.ItemMod')} (${system.action.mod})`);
            }
            if (labelStringList.length) {
                labels.roll = labelStringList.join(' + ');
            }

            if (system.action.opposed.type) {
                const { opposed } = system.action;
                if (opposed.type !== 'custom') labels.opposedRoll = `vs. ${Helpers.label(opposed.type)}`;
                else if (opposed.skill) labels.opposedRoll = `vs. ${Helpers.label(opposed.skill)}+${Helpers.label(opposed.attribute)}`;
                else if (opposed.attribute2) labels.opposedRoll = `vs. ${Helpers.label(opposed.attribute)}+${Helpers.label(opposed.attribute2)}`;
                else if (opposed.attribute) labels.opposedRoll = `vs. ${Helpers.label(opposed.attribute)}`;
            }

            // setup action props
            // go in order of "Limit/Accuracy" "Damage" "AP"
            // don't add action type if set to 'varies' or 'none' as that's pretty much useless info
            if (system.action.type !== '' && system.action.type !== 'varies' && system.action.type !== 'none') {
                props.push(`${Helpers.label(`${game.i18n.localize(SR5.actionTypes[system.action.type])}`)} ${game.i18n.localize('SR5.Action')}`);
            }
            if (system.action.limit) {
                const { limit } = system.action;
                const attribute = limit.attribute ? `[${game.i18n.localize(SR5.limits[limit.attribute])}]` : '';
                const limitVal = limit.value ? limit.value : '';
                let limitStr = '';
                if (attribute) {
                    limitStr += attribute;
                }
                if (limitVal) {
                    if (attribute) {
                        limitStr += ' + ';
                    }
                    limitStr += limitVal;
                }

                if (limitStr) {
                    props.push(`${game.i18n.localize('SR5.Limit')} ${limitStr}`);
                }
            }
            if (system.action.damage.type.value) {
                const { damage } = system.action;
                let damageString = '';
                let elementString = '';
                let operator = SR5.actionDamageFormulaOperators[damage.base_formula_operator] ?? '';
                let attribute = damage.attribute ? `${game.i18n.localize(SR5.attributes[damage.attribute])} ${operator} ` : '';
                if (damage.value || attribute) {
                    const type = damage.type.value ? game.i18n.localize(SR5.damageTypes[damage.type.value]).toUpperCase().charAt(0) : '';
                    damageString = `${game.i18n.localize('SR5.DV')} ${attribute}${damage.value}${type}`;
                }
                if (damage.element.value) {
                    // if we have a damage value and are electric, follow the convention of (e) after
                    if (damage.value) {
                        if (damage.element.value === 'electricity') {
                            damageString += ` (${game.i18n.localize(SR5.elementTypes.electricity).toLowerCase().charAt(0)})`;
                        } else {
                            elementString = Helpers.label(game.i18n.localize(SR5.elementTypes[damage.element.value]));
                        }
                    } else {
                        elementString = Helpers.label(game.i18n.localize(SR5.elementTypes[damage.element.value]));
                    }
                }
                if (damageString) props.push(damageString);
                if (elementString) props.push(elementString);

                const ap = damage.ap;
                operator = SR5.actionDamageFormulaOperators[ap.base_formula_operator] ?? '';
                attribute = ap.attribute ? `${game.i18n.localize(SR5.attributes[ap.attribute])} ${operator} ` : '';
                if (ap.value || attribute) {
                    props.push(`${game.i18n.localize('SR5.AP')} ${attribute}${damage.ap.value}`);
                }
            }
        }
    },

    sin: (system, labels, props) => {
        // Avoid displaying rating null (empty input field) and rating 0.
        if (system.technology.rating) props.push(`${game.i18n.localize('SR5.Rating')} ${system.technology.rating}`);
        system.licenses.forEach((license) => {
            if (license.rtg) props.push(`${license.name} ${game.i18n.localize('SR5.Rating').charAt(0)}${license.rtg}`);
        });
    },

    contact: (system, labels, props) => {
        props.push(system.type);
        props.push(`${game.i18n.localize('SR5.Contact.Connection')} ${system.connection}`);
        props.push(`${game.i18n.localize('SR5.Contact.Loyalty')} ${system.loyalty}`);
        if (system.blackmail) {
            props.push(game.i18n.localize('SR5.Contact.Blackmail'));
        }
        if (system.family) {
            props.push(game.i18n.localize('SR5.Contact.Family'));
        }            
    },

    lifestyle: (system, labels, props) => {
        props.push(game.i18n.localize(SR5.lifestyleTypes[system.type]));
        if (system.cost) props.push(`¥${system.cost}`);
        if (system.comforts) props.push(`${game.i18n.localize('SR5.LifestyleComforts')} ${system.comforts}`);
        if (system.security) props.push(`${game.i18n.localize('SR5.LifestyleSecurity')} ${system.security}`);
        if (system.neighborhood) props.push(`${game.i18n.localize('SR5.LifestyleNeighborhood')} ${system.neighborhood}`);
        if (system.guests) props.push(`${game.i18n.localize('SR5.LifestyleGuests')} ${system.guests}`);
    },

    adept_power: (system, labels, props) => {
        ChatData.action(system, labels, props);
        props.push(`${game.i18n.localize('SR5.PP')} ${system.pp}`);
        props.push(Helpers.label(game.i18n.localize(SR5.adeptPower.types[system.type])));
    },

    armor: (system, labels, props) => {
        if (system.armor) {
            if (system.armor.value) props.push(`${game.i18n.localize('SR5.Armor')} ${system.armor.mod ? '+' : ''}${system.armor.value}`);
            if (system.armor.acid) props.push(`${game.i18n.localize('SR5.ElementAcid')} ${system.armor.acid}`);
            if (system.armor.cold) props.push(`${game.i18n.localize('SR5.ElementCold')} ${system.armor.cold}`);
            if (system.armor.fire) props.push(`${game.i18n.localize('SR5.ElementFire')} ${system.armor.fire}`);
            if (system.armor.electricity) props.push(`${game.i18n.localize('SR5.ElementElectricity')} ${system.armor.electricity}`);
            if (system.armor.radiation) props.push(`${game.i18n.localize('SR5.ElementRadiation')} ${system.armor.radiation}`);
        }
    },

    ammo: (system, labels, props) => {
        if (system.damageType) props.push(`${game.i18n.localize("SR5.DamageType")} ${game.i18n.localize(SR5.damageTypes[system.damageType])}`);
        if (system.damage) props.push(`${game.i18n.localize("SR5.DamageValue")} ${system.damage}`);
        if (system.element) props.push(`${game.i18n.localize("SR5.Element")} ${game.i18n.localize(SR5.elementTypes[system.element])}`);
        if (system.ap) props.push(`${game.i18n.localize("SR5.AP")} ${system.ap}`);
        if (system.blast.radius) props.push(`${game.i18n.localize('SR5.BlastRadius')} ${system.blast.radius}m`);
        if (system.blast.dropoff) props.push(`${game.i18n.localize('SR5.Dropoff')} ${system.blast.dropoff}/m`);
    },

    program: (system, labels, props) => {
        props.push(game.i18n.localize(SR5.programTypes[system.type]));
    },

    complex_form: (system, labels, props) => {
        ChatData.action(system, labels, props);
        props.push(game.i18n.localize(SR5.matrixTargets[system.target]));
        props.push(`${system.duration}`);

        const { fade } = system;
        if (fade > 0) props.push(`${game.i18n.localize('SR5.Fade')} ${game.i18n.localize('SR5.Level').charAt(0)}+${fade}`);
        else if (fade < 0) props.push(`${game.i18n.localize('SR5.Fade')} ${game.i18n.localize('SR5.Level').charAt(0)}${fade}`);
        else props.push(`${game.i18n.localize('SR5.Fade')} ${game.i18n.localize('SR5.Level').charAt(0)}`);
    },

    cyberware: (system, labels, props) => {
        ChatData.action(system, labels, props);
        ChatData.armor(system, labels, props);
        if (system.essence) props.push(`${game.i18n.localize('SR5.AttrEssence').substring(0, 3)} ${system.technology.calculated.essence.value}`);
    },

    bioware: (system, labels, props) => {
        ChatData.action(system, labels, props);
        ChatData.armor(system, labels, props);
        if (system.essence) props.push(`${game.i18n.localize('SR5.AttrEssence').substring(0, 3)} ${system.technology.calculated.essence.value}`);
    },

    device: (system: DeviceData, labels, props) => {
        if (system.technology && system.technology.rating) props.push(`${game.i18n.localize('SR5.Rating')} ${system.technology.rating}`);
        // Show ALL matrix ratings for these devices
        if (system.category === 'cyberdeck' || system.category === 'rcc') {
            for (const attribute of Object.values(system.atts)) {
                props.push(`${Helpers.label(`${game.i18n.localize(SR5.matrixAttributes[attribute.att])}`)} ${attribute.value}`);
            }
        }
        // Commlinks CAN have all values, but tend to only have dp and fw
        // Therefore only show non-zero values
        if (system.category === 'commlink') {
            for (const attribute of Object.values(system.atts)) {
                if (attribute.value) props.push(`${Helpers.label(`${game.i18n.localize(SR5.matrixAttributes[attribute.att])}`)} ${attribute.value}`);
            }
        }
    },

    equipment: (system, labels, props) => {
        ChatData.action(system, labels, props);
        if (system.technology && system.technology.rating) props.push(`${game.i18n.localize('SR5.Rating')} ${system.technology.rating}`);
    },

    quality: (system, labels, props) => {
        ChatData.action(system, labels, props);

        props.push(Helpers.label(game.i18n.localize(SR5.qualityTypes[system.type])));
        if (system.rating) props.push(`${game.i18n.localize('SR5.Rating')} ${system.rating}`);
    },

    sprite_power: (system, labels, props) => {
        // add action data
        ChatData.action(system, labels, props);
    },

    critter_power: (system, labels, props) => {
        props.push(game.i18n.localize(SR5.critterPower.types[system.powerType]));
        props.push(game.i18n.localize(SR5.critterPower.durations[system.duration]));
        props.push(game.i18n.localize(SR5.critterPower.ranges[system.range]));
        if (system.rating) props.push(`${game.i18n.localize('SR5.Rating')} ${system.rating}`);

        // add action data
        ChatData.action(system, labels, props);
    },

    // add properties for spell data, follow order in book
    spell: (system, labels, props) => {
        // first category and type
        props.push(game.i18n.localize(SR5.spellCategories[system.category]), game.i18n.localize(SR5.spellTypes[system.type]));

        // add subtype tags
        if (system.category === 'combat') {
            props.push(game.i18n.localize(SR5.combatSpellTypes[system.combat.type]));
        } else if (system.category === 'health') {
        } else if (system.category === 'illusion') {
            props.push(game.i18n.localize(SR5.illusionSpellTypes[system.illusion.type]));
            props.push(game.i18n.localize(SR5.illusionSpellSenses[system.illusion.sense]));
        } else if (system.category === 'manipulation') {
            if (system.manipulation.damaging) props.push(game.i18n.localize('SR5.Spell.ManipulationDamaging'));
            if (system.manipulation.mental) props.push(game.i18n.localize('SR5.Spell.ManipulationMental'));
            if (system.manipulation.environmental) props.push(game.i18n.localize('SR5.Spell.ManipulationEnvironmental'));
            if (system.manipulation.physical) props.push(game.i18n.localize('SR5.Spell.ManipulationPhysical'));
        } else if (system.category === 'detection') {
            props.push(game.i18n.localize(SR5.detectionSpellTypes[system.detection.type]));
            props.push(system.detection.passive ? game.i18n.localize('SR5.Passive') :  game.i18n.localize('SR5.Active'));
            if (system.detection.extended) props.push(game.i18n.localize('SR5.DetectionSpellExtended'));
        }
        // add range
        props.push(game.i18n.localize(SR5.spellRanges[system.range]));

        // add action data
        ChatData.action(system, labels, props);

        // add duration data
        props.push(game.i18n.localize(SR5.durations[system.duration]));

        // add drain data
        const { drain } = system;
        if (drain > 0) props.push(game.i18n.format('SR5.QuickInfo.DrainForce', {sign: '+', drain}));
        else if (drain < 0) props.push(game.i18n.format('SR5.QuickInfo.DrainForce', {sign: '', drain}));
        else props.push(game.i18n.format('SR5.QuickInfo.DrainForce', {sign: '', drain: ''}));

        labels.roll = 'Cast';
    },

    ritual: (system, labels, props) => {
        props.push(game.i18n.localize(SR5.spellTypes[system.type]));
        props.push(system.descriptors);

        ChatData.action(system, labels, props);
    },

    weapon: (system, labels, props, item: SR5Item) => {
        ChatData.action(system, labels, props);
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            if (prop.includes('Limit')) {
                props[i] = prop.replace('Limit', game.i18n.localize('SR5.Accuracy'));
            }
        }

        const equippedAmmo = item.getEquippedAmmo();
        if (equippedAmmo && system.ammo && system.ammo.current?.max) {
            if (equippedAmmo) {
                const ammoData = equippedAmmo.system as AmmoData;
                const { current, spare_clips } = system.ammo;
                if (equippedAmmo.name) props.push(`${equippedAmmo.name} (${current.value}/${current.max})`);
                if (ammoData.blast.radius) props.push(`${game.i18n.localize('SR5.BlastRadius')} ${ammoData.blast.radius}m`);
                if (ammoData.blast.dropoff) props.push(`${game.i18n.localize('SR5.Dropoff')} ${ammoData.blast.dropoff}/m`);
                if (spare_clips && spare_clips.max) props.push(`${game.i18n.localize('SR5.SpareClips')} (${spare_clips.value}/${spare_clips.max})`);
            }
        }

        if (system.technology?.conceal?.value) {
            props.push(`${game.i18n.localize('SR5.Conceal')} ${system.technology.conceal.value}`);
        }

        if (system.category === 'range') {
            if (system.range.rc) {
                let rcString = `${game.i18n.localize('SR5.RecoilCompensation')} ${system.range.rc.value}`;
                if (item?.actor) {
                    rcString += ` (${game.i18n.localize('SR5.Total')} ${item.totalRecoilCompensation})`;
                }
                props.push(rcString);
            }
            if (system.range.modes) {
                const newModes: Translation[] = [];
                const { modes } = system.range;
                if (modes.single_shot) newModes.push('SR5.Weapon.Mode.SingleShotShort');
                if (modes.semi_auto) newModes.push('SR5.Weapon.Mode.SemiAutoShort');
                if (modes.burst_fire) newModes.push('SR5.Weapon.Mode.BurstFireShort');
                if (modes.full_auto) newModes.push('SR5.Weapon.Mode.FullAutoShort');
                props.push(newModes.map((m) => game.i18n.localize(m)).join('/'));
            }
            if (system.range.ranges) {
                /**
                 * Display weapon ranges in this format: <CATEGORY (short/medium/long/extreme/attribute)
                 */
                const { short, medium, long, extreme, category, attribute } = system.range.ranges;
                const categoryLabel = game.i18n.localize(SR5.weaponRangeCategories[category]?.label ?? '');
                let output = `${categoryLabel} (${short}/${medium}/${long}/${extreme})`;
                if (attribute) {
                    output += `/${attribute}`;
                }
                props.push(output);
            }
        } else if (system.category === 'melee') {
            if (system.melee.reach) {
                const reachString = `${game.i18n.localize('SR5.Reach')} ${system.melee.reach}`;
                // find accuracy in props and insert ourselves after it
                const accIndex = props.findIndex((p) => p.includes('Accuracy'));
                if (accIndex > -1) {
                    props.splice(accIndex + 1, 0, reachString);
                } else {
                    props.push(reachString);
                }
            }
        } else if (system.category === 'thrown') {
            const { blast } = system.thrown;
            if (blast?.radius) props.push(`${game.i18n.localize('SR5.BlastRadius')} ${blast.radius}m`);
            if (blast?.dropoff) props.push(`${game.i18n.localize('SR5.Dropoff')} ${blast.dropoff}/m`);

            if (system.thrown.ranges) {
                const mult = system.thrown.ranges.attribute && item?.actor ? item.actor.system.attributes[system.thrown.ranges.attribute].value : 1;
                const ranges = [system.thrown.ranges.short, system.thrown.ranges.medium, system.thrown.ranges.long, system.thrown.ranges.extreme];
                props.push(ranges.map((v) => v * mult).join('/'));
            }
        }

        const equippedMods = item.getEquippedMods();
        if (equippedMods) {
            equippedMods.forEach((mod) => {
                props.push(`${mod.name}`);
            });
        }
    },
};
