require('dotenv').config({ path: '../../.env' }); // Look up two folders to find the secret .env file

/**
 * Fetches property data from RentCast API
 * Target outputs: squareFootage, yearBuilt, propertyType
 */
async function getPropertyData(address) {
    const apiKey = process.env.RENTCAST_API_KEY;
    
    if (!apiKey) {
        console.error("Error: RENTCAST_API_KEY is missing from .env file.");
        return;
    }

    // Format the address for the URL query
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.rentcast.io/v1/properties?address=${encodedAddress}`;

    try {
        console.log(`Fetching data for: ${address}...`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const property = data[0];
            
            console.log(`\n--- Data Found ---`);
            console.log(`Square Footage: ${property.squareFootage || 'N/A'}`);
            console.log(`Year Built: ${property.yearBuilt || 'N/A'}`);
            console.log(`Property Type: ${property.propertyType || 'N/A'}`);
            // Note: RentCast rarely returns 'stories', which is why we will 
            // rely on Gemini Vision for height extrapolation next!
            
            return {
                squareFootage: property.squareFootage,
                yearBuilt: property.yearBuilt,
                propertyType: property.propertyType
            };
        } else {
            console.log(`No data found for address: ${address}`);
            return null;
        }

    } catch (error) {
        console.error("Failed to fetch property data:", error);
    }
}

// --- Test the function ---
// Let's test it with a real address in your market
getPropertyData("3163 Red Apple Pl, Castle Rock, CO 80104");