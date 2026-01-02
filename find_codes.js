
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function search(term) {
    const { data } = await supabase
        .from('icd10_codes')
        .select('code, description_th, description_en')
        .or(`description_th.ilike.%${term}%,description_en.ilike.%${term}%`)
        .limit(3);
    console.log(`\nResults for "${term}":`);
    if (data) data.forEach(d => console.log(`- ${d.code}: ${d.description_th} (${d.description_en})`));
}

async function main() {
    await search('nasopharyngitis'); // Cold
    await search('Myalgia'); // Muscle pain
    await search('Gastritis'); // Stomach
    await search('Gastroenteritis'); // Diarrhea
    await search('Open wound'); // Wound
}

main();
