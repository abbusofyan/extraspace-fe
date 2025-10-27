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
        'PromotionID',
        'DiscountType',
        'MinDuration',
        'Discount$',
        'Discount%',
        'XAmount',
        'NumberOfMonthsFree',
        'WhichMonthFree',
        'NumberOfRedemptionsAllowed',
        'LocationCode',
        'UnitType-Size',
        'StartDate',
        'EndDate',
        'Status',
        'EnglishPromotionName',
        'MalayPromotionName',
        'ChinesePromotionName',
        'KoreanPromotionName',
        'PromoCode'
    ];

    const data = promotions.map(promo => ({
        PromotionID: promo.identifier,
        DiscountType: promo.discount_type,
        MinDuration: promo.min_duration,
        "Discount$": promo.discount_amount,
        "Discount%": promo.discount_percentage,
        XAmount: promo.x_amount ?? '',
        NumberOfMonthsFree: promo.number_of_months_free ?? '',
        WhichMonthFree: promo.which_month_free ?? '',
        NumberOfRedemptionsAllowed: promo.total_quota,
		LocationCode: Array.isArray(promo.facilities)
            ? promo.facilities.map(fac => fac.code).join(', ')
            : '',
		"UnitType-Size": Array.isArray(promo.units)
            ? promo.units
                .map(u => `${u.unit_type?.name ?? ''} - ${u.size?.name ?? ''}`)
                .filter(v => v.trim() !== ' - ')
                .join(', ')
            : '',
        StartDate: promo.start_date,
        EndDate: promo.end_date,
        Status: promo.status_text,
        EnglishPromotionName: promo.name_en,
        MalayPromotionName: promo.name_ms,
        ChinesePromotionName: promo.name_zh,
        KoreanPromotionName: promo.name_ko,
        PromoCode: promo.promo_code,
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
            'PromotionID': '',
            'DiscountType': '',
            'MinDuration': '',
            'Discount$': '',
            'Discount%': '',
            'XAmount': '',
            'NumberOfMonthsFree': '',
            'WhichMonthFree': '',
            'NumberOfRedemptionsAllowed': '',
            'LocationCode': '',
            'UnitType-Size': '',
            'StartDate': '',
            'EndDate': '',
            'Status': '',
            'EnglishPromotionName': '',
            'MalayPromotionName': '',
            'ChinesePromotionName': '',
            'KoreanPromotionName': '',
            'PromoCode': '',
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
                const data = new Uint8Array(e.target ?.result as ArrayBuffer);
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
                            return { unitType: unitType ?.trim() || '', size: size ?.trim() || '' };
                        });

                    return {
                        id: row['Promotion ID'] ?.toString() || '',
                        name: row['Promotion Name'] ?.toString() || '',
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
