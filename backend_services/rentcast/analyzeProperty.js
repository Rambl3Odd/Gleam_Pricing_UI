require('dotenv').config({ path: '../../.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 1. REGIONAL DNA LOOKUP
 */
const regionalDNA = {
    "80108": { rho: 1.15, phi: 1.60, description: "Luxury Custom / High Glass Density" },
    "80109": { rho: 1.15, phi: 1.45, description: "Modern Tract/Custom / High Egress Probability" },
    "80206": { rho: 1.25, phi: 1.40, description: "Historic Core / French Grid Dominance" },
    "99352": { rho: 0.95, phi: 1.25, description: "PNW Contemporary / Rambler Styles" }
};

/**
 * 2. DETERMINISTIC ACTUARIAL CALCULATOR
 */
function calculateBaselines(agsf, bgsf, basementBeds, yearBuilt, zipCode) {
    const dna = regionalDNA[zipCode] || { rho: 1.10, phi: 1.15, description: "Standard Residential" };
    
    // Hyper-Scale Guardrail
    let baseHousePanes;
    if (agsf > 4500) {
        baseHousePanes = 55 + Math.log10(agsf - 4400) * 15;
    } else {
        baseHousePanes = (agsf / 100) * dna.rho * dna.phi;
    }

    // IRC Basement Logic
    const basementPanes = (basementBeds * 2) + Math.round(((bgsf - (basementBeds * 250)) / 600) * 2);

    // Skylight Probability
    const estSkylights = (agsf > 3500 || dna.description.includes("PNW")) ? 2 : 0;

    return {
        houseTotal: Math.round(baseHousePanes),
        basementPanes,
        garageTarget: 12,
        estSkylights,
        dnaDescription: dna.description
    };
}

async function analyzePropertyWithAI(address, agsf, bgsf, totalBeds, basementBeds, yearBuilt, stories) {
    const mapsApiKey = process.env.GOOGLE_MAPS_HTTP_KEY.trim();
    const encodedAddress = encodeURIComponent(address);
    const zipCode = address.match(/\b\d{5}\b/)?.[0] || "80109";
    const baseline = calculateBaselines(agsf, bgsf, basementBeds, yearBuilt, zipCode);

    // 3. TRIPLE-ANGLE STREET VIEW
    const urls = [
        `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodedAddress}&fov=100&key=${mapsApiKey}`,
        `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodedAddress}&fov=90&heading=-40&key=${mapsApiKey}`,
        `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodedAddress}&fov=90&heading=40&key=${mapsApiKey}`
    ];

    try {
        const responses = await Promise.all(urls.map(url => fetch(url)));
        const buffers = await Promise.all(responses.map(res => res.arrayBuffer()));
        const imageParts = buffers.map(buf => ({
            inlineData: { data: Buffer.from(buf).toString('base64'), mimeType: "image/jpeg" }
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are the Gleam Services Lead Auditor. Audit the 3 images against our Actuarial Baselines.
        
        PROPERTY CONTEXT:
        - DNA Profile: ${baseline.dnaDescription} | Year Built: ${yearBuilt}
        - Math Baseline: ~${baseline.houseTotal} House Panes | ~${baseline.basementPanes} Basement Panes
        - Target Skylights: ${baseline.estSkylights} | Target Garage Panes: ${baseline.garageTarget}

        AUDIT INSTRUCTIONS:
        1. LEVEL BREAKDOWN: Attribute House Panes to Level 1, Level 2, or Level 3.
        2. TYPE BREAKDOWN: Identify Standard vs. Non-Standard (French Grids/Divided Lights) vs. Large Picture/Sliders.
        3. ROOF: Specifically look for Skylights.
        4. GARAGE: Reconcile visual garage door panes against target (${baseline.garageTarget}). Use 25% variance rule.
        5. DISTRIBUTION: Distribute the REMAINDER of ${baseline.houseTotal} panes to standard house windows.

        RETURN JSON:
        {
          "reconciled_garage": <int>,
          "skylights": <int>,
          "has_storm_door": <boolean>,
          "levels": {
            "L1": { "standard": <int>, "non_standard": <int>, "slider_units": <int>, "picture_units": <int> },
            "L2": { "standard": <int>, "non_standard": <int>, "slider_units": <int>, "picture_units": <int> },
            "L3": { "standard": <int>, "non_standard": <int>, "picture_units": <int> }
          },
          "basement": { "egress_units": <int>, "standard_units": <int> }
        }
        `;

        const result = await model.generateContent([prompt, ...imageParts]);
        const data = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());

        // 4. UNIT-BASED SCREEN MATH
        const totalStdUnits = Math.floor((data.levels.L1.standard + data.levels.L1.non_standard + data.levels.L2.standard + data.levels.L2.non_standard) / 2);
        const totalSliderUnits = data.levels.L1.slider_units + data.levels.L2.slider_units;
        const totalEgressUnits = data.basement.egress_units;
        
        const finalScreens = (totalStdUnits - 2) + totalSliderUnits + totalEgressUnits + (data.has_storm_door ? 1 : 0);

        console.log("\n--- GLEAM MASTER ESTIMATE REPORT ---");
        console.log(`🏠 ADDRESS: ${address}`);
        console.log(`✅ TOTAL SCREENS/TRACKS: ${finalScreens}`);
        console.log(`📦 OPTIONAL GARAGE DOOR PANES: ${data.reconciled_garage}`);
        console.log(`✨ ROOF SKYLIGHTS: ${data.skylights}`);
        console.log(`\nLEVEL 1: ${data.levels.L1.standard} Std, ${data.levels.L1.non_standard} Non-Std, ${data.levels.L1.slider_units} Sliders`);
        console.log(`LEVEL 2: ${data.levels.L2.standard} Std, ${data.levels.L2.non_standard} Non-Std, ${data.levels.L2.slider_units} Sliders`);
        console.log(`BASEMENT: ${data.basement.egress_units} Egress, ${data.basement.standard_units} Std`);

    } catch (error) {
        console.error("❌ AUDIT FAILED:", error.message);
    }
}

// THE FINAL TEST
analyzePropertyWithAI("2154 Treetop Dr, Castle Rock, CO 80109", 3400, 1700, 5, 2, 2017, 2);