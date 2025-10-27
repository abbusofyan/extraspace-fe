import * as XLSX from "xlsx";

export interface Promotion {
  id: string;
  name: string;
  discountType: 'monthly recurring discount' | 'x free months';
  minStorageDuration: number;
  discountPercentage?: number;
  numberOfMonthsFree?: number;
  redemptionsAvailable: number;
  redemptionsLeft: number;
  country: string;
  facility: string;
  unitTypeSizePairs: Array<{ unitType: string; size: string }>;
  startDate: string;
  endDate: string;
  status: 'active' | 'not-active';
  promoCode: string;
  createdAt: string;
}

/**
 * Convert promotions array to Excel format (.xlsx)
 */
export function exportPromotionsToExcel(promotions: Promotion[]): void {
  const headers = [
    'Promotion ID',
    'Promotion Name',
    'Discount Type',
    'Min Storage Duration (months)',
    'Discount Percentage',
    'Number of Months Free',
    'Redemptions Available',
    'Redemptions Left',
    'Country',
    'Facility',
    'Unit Type-Size Pairs',
    'Start Date',
    'End Date',
    'Status',
    'Promo Code',
    'Created At'
  ];

  const data = promotions.map(promo => ({
    'Promotion ID': promo.id,
    'Promotion Name': promo.name,
    'Discount Type': promo.discountType,
    'Min Storage Duration (months)': promo.minStorageDuration,
    'Discount Percentage': promo.discountPercentage ?? '',
    'Number of Months Free': promo.numberOfMonthsFree ?? '',
    'Redemptions Available': promo.redemptionsAvailable,
    'Redemptions Left': promo.redemptionsLeft,
    'Country': promo.country,
    'Facility': promo.facility,
    'Unit Type-Size Pairs': promo.unitTypeSizePairs.map(pair => `${pair.unitType}:${pair.size}`).join(';'),
    'Start Date': promo.startDate,
    'End Date': promo.endDate,
    'Status': promo.status,
    'Promo Code': promo.promoCode,
    'Created At': promo.createdAt
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Promotions');

  // Export to Excel
  const filename = `promotions_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Generate Excel template for bulk upload
 */
export function downloadExcelTemplate(): void {
  const exampleData = [
    {
      'Promotion ID': 'PROMO001',
      'Promotion Name': 'Example Promotion',
      'Discount Type': 'monthly recurring discount',
      'Min Storage Duration (months)': 6,
      'Discount Percentage': 20,
      'Number of Months Free': '',
      'Redemptions Available': 100,
      'Redemptions Left': 100,
      'Country': 'Singapore',
      'Facility': 'Ang Mo Kio',
      'Unit Type-Size Pairs': 'Aircon:Small;Aircon:Medium',
      'Start Date': '2024-01-01',
      'End Date': '2024-12-31',
      'Status': 'active',
      'Promo Code': 'EXAMPLE2024',
      'Created At': new Date().toISOString(),
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(exampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  XLSX.writeFile(workbook, 'promotions_template.xlsx');
}

/**
 * Parse Excel file and return promotions array
 */
export function parseExcelFile(file: File): Promise<Promotion[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

        const promotions: Promotion[] = jsonData.map((row, index) => {
          const unitTypeSizePairs = (row['Unit Type-Size Pairs'] || '')
            .split(';')
            .filter((pair: string) => pair.trim())
            .map((pair: string) => {
              const [unitType, size] = pair.split(':');
              return { unitType: unitType?.trim() || '', size: size?.trim() || '' };
            });

          return {
            id: row['Promotion ID']?.toString() || '',
            name: row['Promotion Name']?.toString() || '',
            discountType: row['Discount Type'] as 'monthly recurring discount' | 'x free months',
            minStorageDuration: parseInt(row['Min Storage Duration (months)']) || 0,
            discountPercentage: row['Discount Percentage'] ? parseFloat(row['Discount Percentage']) : undefined,
            numberOfMonthsFree: row['Number of Months Free'] ? parseInt(row['Number of Months Free']) : undefined,
            redemptionsAvailable: parseInt(row['Redemptions Available']) || 0,
            redemptionsLeft: parseInt(row['Redemptions Left']) || 0,
            country: row['Country'] || '',
            facility: row['Facility'] || '',
            unitTypeSizePairs,
            startDate: row['Start Date'] || '',
            endDate: row['End Date'] || '',
            status: row['Status'] as 'active' | 'not-active',
            promoCode: row['Promo Code'] || '',
            createdAt: row['Created At'] || ''
          };
        });

        resolve(promotions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
}
