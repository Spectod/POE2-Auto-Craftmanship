const fs = require('fs');
const path = require('path');

// Path to the mods_tiers_by_name.json file
const modsFilePath = path.join(__dirname, '..', 'poe2-crafting-frontend', 'src', 'assets', 'data', 'mods_tiers_by_name.json');

// Output markdown file path
const outputMdPath = path.join(__dirname, '..', 'MODS_TIERS_BY_NAME.md');

// Read the JSON file
fs.readFile(modsFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        const modsData = JSON.parse(data);

        let markdownContent = '# POE2 Mods Tiers by Name\n\n';
        markdownContent += 'This document contains all mods with their tiers, values, and metadata.\n\n';

        // Iterate through each mod
        for (const [modName, tiers] of Object.entries(modsData)) {
            markdownContent += `## ${modName}\n\n`;

            if (tiers.length > 0) {
                // Get unique mtypeNames and groupNames
                const mtypeNames = [...new Set(tiers.flatMap(tier => tier.mtypeNames || []))];
                const groupNames = [...new Set(tiers.flatMap(tier => tier.groupNames || []))];

                if (mtypeNames.length > 0) {
                    markdownContent += `**Mod Types:** ${mtypeNames.join(', ')}\n\n`;
                }

                if (groupNames.length > 0) {
                    markdownContent += `**Groups:** ${groupNames.join(', ')}\n\n`;
                }

                // Create table
                markdownContent += '| Tier | iLvl | Min Value | Max Value | Max Value | Weighting | Source | Mod ID |\n';
                markdownContent += '|------|------|-----------|-----------|-----------|-----------|--------|--------|\n';

                tiers.forEach(tier => {
                    const minValue = tier.values && tier.values[0] && tier.values[0][0] !== undefined ? tier.values[0][0] : 'N/A';
                    const maxValue = tier.values && tier.values[0] && tier.values[0][1] !== undefined ? tier.values[0][1] : 'N/A';
                    const maxVal = tier.maxValue !== undefined ? tier.maxValue : 'N/A';
                    const weighting = tier.weighting !== undefined ? tier.weighting : 'N/A';
                    const source = tier.source || 'N/A';
                    const modId = tier.modId !== undefined ? tier.modId : 'N/A';

                    markdownContent += `| ${tier.tier} | ${tier.ilvl} | ${minValue} | ${maxValue} | ${maxVal} | ${weighting} | ${source} | ${modId} |\n`;
                });

                markdownContent += '\n';
            }
        }

        // Write the markdown file
        fs.writeFile(outputMdPath, markdownContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('Markdown file generated successfully:', outputMdPath);
        });

    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }
});