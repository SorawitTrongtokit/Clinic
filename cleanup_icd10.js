
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = 'C:\\Users\\User\\Downloads\\Data TM2019-update_052024.xlsx';

async function main() {
    console.log('Reading Excel file to get valid codes...');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // Create Set of valid codes
    const validCodes = new Set();
    rawData.forEach(row => {
        let code = row['ICD-10-TM2019'];
        if (code) validCodes.add(String(code).trim());
    });

    console.log(`Valid codes count: ${validCodes.size}`);

    // Fetch all codes from DB (ID only to save bandwidth if possible, or code)
    // We need to fetch in chunks if it's too big, but 39k is manageable for Node memory, 
    // maybe not single select limit. Supabase limit is usually 1000.

    // Changing strategy: Since we suspect only a FEW extras, we can fetch ALL codes in pages and check them.

    const BATCH = 1000;
    let offset = 0;
    let allDbCodes = [];

    while (true) {
        const { data, error } = await supabase
            .from('icd10_codes')
            .select('code')
            .range(offset, offset + BATCH - 1);

        if (error) {
            console.error('Error fetching DB codes:', error);
            break;
        }
        if (!data || data.length === 0) break;

        data.forEach(d => allDbCodes.push(d.code));
        offset += BATCH;
        process.stdout.write(`\rFetched ${allDbCodes.length}`);
    }

    console.log('\nScanning for extras...');
    const extras = allDbCodes.filter(c => !validCodes.has(c));

    console.log(`Found ${extras.length} extra codes:`, extras);

    if (extras.length > 0) {
        console.log('Checking usage in visits table...');

        // 1. Update visits that use these codes to set icd10_code = NULL
        const { error: updateError } = await supabase
            .from('visits')
            .update({ icd10_code: null })
            .in('icd10_code', extras);

        if (updateError) {
            console.error('Error removing references from visits:', updateError);
            return;
        }

        console.log('Removed references from visits. Now deleting codes...');

        const { error } = await supabase
            .from('icd10_codes')
            .delete()
            .in('code', extras);

        if (error) console.error('Delete error:', error);
        else console.log('Successfully deleted extras.');
    } else {
        console.log('Database is clean.');
    }
}

main();
