-- ICD10 Codes
INSERT INTO icd10_codes (code, description_th, description_en) VALUES
('J00', 'โรคหวัด (Acute nasopharyngitis [common cold])', 'Acute nasopharyngitis [common cold]'),
('J01', 'ไซนัสอักเสบเฉียบพลัน', 'Acute sinusitis'),
('J02', 'คออักเสบเฉียบพลัน', 'Acute pharyngitis'),
('J03', 'ทอนซิลอักเสบเฉียบพลัน', 'Acute tonsillitis'),
('J20', 'หลอดลมอักเสบเฉียบพลัน', 'Acute bronchitis'),
('A09', 'อุจจาระร่วงและลำไส้อักเสบจากการติดเชื้อ', 'Infectious gastroenteritis'),
('K29', 'กระเพาะอาหารและลำไส้เล็กส่วนต้นอักเสบ', 'Gastritis and duodenitis'),
('M79.1', 'ปวดกล้ามเนื้อ', 'Myalgia'),
('R51', 'ปวดศีรษะ', 'Headache'),
('T14.1', 'แผลเปิดของส่วนที่ไม่ระบุรายละเอียดของร่างกาย', 'Open wound');

-- Medicines (Stock)
INSERT INTO medicines (name, price_per_unit, unit, stock_qty) VALUES
('Paracetamol 500mg', 1.00, 'เม็ด', 1000),
('Amoxycillin 500mg', 2.00, 'เม็ด', 500),
('CPM (Chlorpheniramine)', 0.50, 'เม็ด', 800),
('ORS ผงเกลือแร่', 5.00, 'ซอง', 200),
('Betadine Solution 15ml', 45.00, 'ขวด', 50),
('Alcohol 70% 60ml', 35.00, 'ขวด', 100),
('Dimenhydrinate (แก้เมารถ)', 1.00, 'เม็ด', 300),
('Omeprazole 20mg', 3.00, 'เม็ด', 400),
('Simethicone (ขับลม)', 1.50, 'เม็ด', 300);
