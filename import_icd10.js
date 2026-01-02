
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try to prioritize a service role key if manually added to .env.local, else anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing credentials in .env.local');
    process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

const filePath = 'C:\\Users\\User\\Downloads\\Data TM2019-update_052024.xlsx';

async function main() {
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    console.log('Reading Excel file...');
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Loaded ${rawData.length} rows from sheet "${firstSheetName}".`);

    if (rawData.length === 0) {
        console.log('No data found.');
        return;
    }

    // Map data to table structure
    // Table: icd10_codes (code, description_th, description_en)
    // Excel: "ICD-10-TM2019", "Description"
    const records = [];

    for (const row of rawData) {
        // Keys depend on exactly how XLSX parses the header. 
        // Sometimes headers have spaces. 
        // We'll iterate row keys to find matches if direct access fails, but first try direct.
        let code = row['ICD-10-TM2019'];
        let desc = row['Description'];

        if (code && desc) {
            records.push({
                code: String(code).trim(),
                description_en: String(desc).trim(),
                description_th: String(desc).trim(),
            });
        }
    }

    console.log(`Prepared ${records.length} records for upsert.`);

    // Batch Upsert
    const CHUNK_SIZE = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase.from('icd10_codes').upsert(chunk, { onConflict: 'code' });

        if (error) {
            // If 401/403, unlikely to succeed for rest.
            console.error(`\nError upserting batch ${i}-${i + CHUNK_SIZE}:`, error.message);
            errorCount += chunk.length;
            if (error.code === '42501' || error.message.includes('permission')) {
                console.error("Permission denied. Row Level Security policy likely prevents ANONYMOUS writes.");
                console.error("Please add SUPABASE_SERVICE_ROLE_KEY=... to .env.local and retry.");
                process.exit(1);
            }
        } else {
            successCount += chunk.length;
            if (i % 1000 === 0) {
                process.stdout.write(`\rProgress: ${successCount}/${records.length}`);
            }
        }
    }

    console.log('\nImport finished.');
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
}

main().catch(err => console.error(err));
