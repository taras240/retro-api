export const allLevelNames = [
    'Level', 'Levels', 'Stage\\b', 'Stages', 'Area', 'World', 'Mission', 'Chapter', 'Section',
    'Zone', 'Phase', 'Phases', 'Realm', 'Domain', 'Episode', 'Act', 'Acts', 'Tier', 'Floor', 'Floors',
    'Dimension', 'Region', 'Scene', 'Screen', 'Round\\b', 'Course', 'Board', "Quest"
];

export const RPLevelNames = [...allLevelNames, ...allLevelNames.map(l => l.toLowerCase()), '🚩', '\\bin\\b'];

export const zoneNames = [
    'Zone', 'Stage', 'Area', 'Mission', 'Chapter', 'Section', 'World', 'Scene'
];

//'level','levels','stage','area','world','mission','chapter','section','part','zone','phase','realm','domain','episode','act','sequence','tier','floor','dimension','region','floor','scene',