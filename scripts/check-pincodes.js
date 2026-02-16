const fetch = require('node-fetch');

const pincodes = [
    { code: '600001', name: 'Chennai Central' },
    { code: '603001', name: 'Chengalpattu' },
    { code: '631501', name: 'Kanchipuram' },
    { code: '602001', name: 'Tiruvallur' },
    { code: '600028', name: 'RA Puram (Chennai)' }
];

async function checkPincodes() {
    console.log('Checking Pincode API responses...');

    for (const p of pincodes) {
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${p.code}`);
            const data = await response.json();

            if (data[0].Status === 'Success') {
                const district = data[0].PostOffice[0].District;
                const state = data[0].PostOffice[0].State;
                console.log(`[${p.code}] Expected: ${p.name} | Got District: "${district}" | State: "${state}"`);
            } else {
                console.log(`[${p.code}] Failed: ${data[0].Message}`);
            }
        } catch (error) {
            console.error(`[${p.code}] Error:`, error.message);
        }
    }
}

checkPincodes();
