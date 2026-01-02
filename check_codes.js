
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check(codePrefix) {
    const { data } = await supabase
        .from('icd10_codes')
        .select('code, description_th')
        .ilike('code', `${codePrefix}%`)
        .limit(1);

    if (data && data.length > 0) {
        console.log(`Match for ${codePrefix}: ${data[0].code} - ${data[0].description_th}`);
        return data[0];
    } else {
        console.log(`No match for ${codePrefix}`);
        return null;
    }
}

async function main() {
    await check('J00'); // Cold
    await check('M79'); // Myalgia (M79.1?)
    await check('K29'); // Gastritis (K29.7?)
    await check('A09'); // Gastroenteritis
    await check('T14'); // Open wound (T14.1?)
    // Also check generic description if code fails
}

main();
