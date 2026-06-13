/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates an SVG string representation of an M-Pesa transaction receipt screenshot and returns it as a data URI.
 */
export const generateMpesaSvg = (amount: number, refNo: string, studentName: string, dateStr: string): string => {
  const cleanStudent = studentName || "Not Set";
  const cleanRef = (refNo || "QHK82JD71Y").toUpperCase();
  const balance = amount.toLocaleString();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <defs>
      <linearGradient id="mpesaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#E8F5E9" />
        <stop offset="100%" stop-color="#C8E6C9" />
      </linearGradient>
    </defs>
    <rect width="400" height="500" rx="20" fill="url(#mpesaGrad)" stroke="#81C784" stroke-width="2"/>
    <rect width="400" height="75" fill="#4CAF50" rx="18"/>
    
    <text x="24" y="44" fill="white" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="18" letter-spacing="0.5">Safaricom M-PESA</text>
    <text x="376" y="44" fill="#C8E6C9" font-family="monospace" font-weight="bold" font-size="11" text-anchor="end">TX_SUCCESS</text>
    
    <text x="200" y="130" fill="#2E7D32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif" font-weight="900" font-size="30" text-anchor="middle">KES ${balance}.00</text>
    <text x="200" y="152" fill="#558B2F" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif" font-weight="700" font-size="11" text-anchor="middle" letter-spacing="1">PAID TO ROCKSIDE ACADEMY</text>
    
    <line x1="30" y1="180" x2="370" y2="180" stroke="#A5D6A7" stroke-width="1.5" stroke-dasharray="6 4"/>
    
    <!-- transaction fields -->
    <g transform="translate(0, 195)">
      <text x="40" y="20" fill="#4E6952" font-family="-apple-system, sans-serif" font-weight="bold" font-size="11">TRANSACTION REF</text>
      <text x="360" y="20" fill="#1B5E20" font-family="monospace" font-weight="900" font-size="13" text-anchor="end">${cleanRef}</text>
      
      <text x="40" y="55" fill="#4E6952" font-family="-apple-system, sans-serif" font-weight="bold" font-size="11">PAYMENT DATE</text>
      <text x="360" y="55" fill="#212121" font-family="-apple-system, sans-serif" font-weight="600" font-size="12" text-anchor="end">${dateStr} 11:24 AM</text>
      
      <text x="40" y="90" fill="#4E6952" font-family="-apple-system, sans-serif" font-weight="bold" font-size="11">STUDENT NAME</text>
      <text x="360" y="90" fill="#212121" font-family="-apple-system, sans-serif" font-weight="bold" font-size="12" text-anchor="end">${cleanStudent}</text>

      <text x="40" y="125" fill="#4E6952" font-family="-apple-system, sans-serif" font-weight="bold" font-size="11">SYSTEM NODE</text>
      <text x="360" y="125" fill="#1B5E20" font-family="monospace" font-weight="bold" font-size="12" text-anchor="end">eTIMS_LEDGER_01</text>
    </g>

    <line x1="30" y1="355" x2="370" y2="355" stroke="#A5D6A7" stroke-width="1.5" stroke-dasharray="6 4"/>
    
    <rect x="30" y="380" width="340" height="90" fill="white" rx="14" stroke="#4CAF50" stroke-width="1.5" stroke-dasharray="4"/>
    <text x="200" y="414" fill="#1B5E20" font-family="-apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="0.5">M-PESA DEPOSIT RECONCILED</text>
    <text x="200" y="438" fill="#666" font-family="-apple-system, sans-serif" font-size="10" text-anchor="middle">Safaricom Paybill 400222 account cleared.</text>
    <text x="200" y="452" fill="#999" font-family="monospace" font-size="8" text-anchor="middle">RECONCILED BY ROCKSIDE SCHOOL BURSAR</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Generates an SVG representation of an official Co-operative Bank Deposit Slip.
 */
export const generateBankSlipSvg = (amount: number, refNo: string, studentName: string, dateStr: string): string => {
  const cleanStudent = studentName || "Not Set";
  const cleanRef = (refNo || "FT26162947").toUpperCase();
  const balance = amount.toLocaleString();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <rect width="400" height="500" rx="16" fill="#F4F6F7" stroke="#CFD8DC" stroke-width="3"/>
    <rect width="400" height="75" fill="#0D47A1" rx="14"/>
    
    <text x="24" y="44" fill="white" font-family="sans-serif" font-weight="900" font-size="16" letter-spacing="1">THE CO-OPERATIVE BANK</text>
    <text x="376" y="44" fill="#90CAF9" font-family="monospace" font-weight="bold" font-size="11" text-anchor="end">CASH DEPOSIT</text>
    
    <text x="200" y="130" fill="#0D47A1" font-family="sans-serif" font-weight="900" font-size="28" text-anchor="middle">KES ${balance}.00</text>
    <text x="200" y="152" fill="#546E7A" font-family="sans-serif" font-weight="700" font-size="10" text-anchor="middle" letter-spacing="2">DEPOSIT TRANSACTED SUCCESSFULLY</text>
    
    <line x1="30" y1="180" x2="370" y2="180" stroke="#B0BEC5" stroke-width="2"/>
    
    <g transform="translate(0, 195)">
      <text x="40" y="20" fill="#78909C" font-family="sans-serif" font-weight="bold" font-size="10">DEPOSIT SLIP REF/CHALLAN</text>
      <text x="360" y="20" fill="#263238" font-family="monospace" font-weight="900" font-size="13" text-anchor="end">${cleanRef}</text>
      
      <text x="40" y="55" fill="#78909C" font-family="sans-serif" font-weight="bold" font-size="10">SCHOOL BANK ACC NO</text>
      <text x="360" y="55" fill="#263238" font-family="sans-serif" font-weight="bold" font-size="12" text-anchor="end">01129487572900</text>
      
      <text x="40" y="90" fill="#78909C" font-family="sans-serif" font-weight="bold" font-size="10">STUDENT / FEE LEDGER</text>
      <text x="360" y="90" fill="#263238" font-family="sans-serif" font-weight="bold" font-size="12" text-anchor="end">${cleanStudent}</text>

      <text x="40" y="125" fill="#78909C" font-family="sans-serif" font-weight="bold" font-size="10">TRANSACTION DATE</text>
      <text x="360" y="125" fill="#263238" font-family="sans-serif" font-weight="semibold" font-size="11" text-anchor="end">${dateStr}</text>
    </g>

    <line x1="30" y1="355" x2="370" y2="355" stroke="#B0BEC5" stroke-width="2"/>
    
    <rect x="30" y="380" width="340" height="90" fill="white" rx="10" stroke="#0D47A1" stroke-width="1.5" stroke-dasharray="3"/>
    
    <!-- Circular Stamp Vector on Slip -->
    <circle cx="320" cy="425" r="30" fill="none" stroke="#E53935" stroke-width="1.5" stroke-dasharray="40 10" opacity="0.65"/>
    <text x="320" y="422" fill="#E53935" font-family="sans-serif" font-size="6" font-weight="bold" text-anchor="middle" font-style="italic" opacity="0.7">CO-OP BANK</text>
    <text x="320" y="430" fill="#E53935" font-family="sans-serif" font-size="6" font-weight="bold" text-anchor="middle" font-style="italic" opacity="0.7">TELLER COMP</text>
    <text x="320" y="438" fill="#E53935" font-family="sans-serif" font-size="5" text-anchor="middle" opacity="0.6">NAIROBI</text>

    <text x="170" y="415" fill="#263238" font-family="sans-serif" font-size="12" font-weight="800" text-anchor="start">BANK RECEIPT STAMP</text>
    <text x="170" y="435" fill="#546E7A" font-family="sans-serif" font-size="10" text-anchor="start">Co-operative Clearing House</text>
    <text x="170" y="450" fill="#90A4AE" font-family="sans-serif" font-size="8" text-anchor="start">Deposit verified via school secure XML node.</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Generates an SVG representation of an Equity Banker's Cheque scan.
 */
export const generateChequeSlipSvg = (amount: number, refNo: string, studentName: string, dateStr: string): string => {
  const cleanStudent = studentName || "Not Set";
  const cleanRef = (refNo || "004123").replace(/\D/g, "") || "004123";
  const balance = amount.toLocaleString();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 250" width="100%" height="100%">
    <rect width="500" height="250" fill="#ECEFF1" rx="10" stroke="#78909C" stroke-width="4"/>
    
    <text x="25" y="34" fill="#E65100" font-family="sans-serif" font-weight="900" font-size="15" letter-spacing="1">EQUITY BANK KENYA</text>
    <text x="475" y="34" fill="#37474F" font-family="sans-serif" font-size="11" text-anchor="end">DATE: ${dateStr}</text>
    
    <line x1="20" y1="48" x2="480" y2="48" stroke="#90A4AE" stroke-width="2.5"/>
    
    <!-- Check body -->
    <text x="30" y="85" fill="#546E7A" font-family="sans-serif" font-weight="bold" font-size="9" letter-spacing="0.5">PAY </text>
    <text x="70" y="85" fill="#1A237E" font-family="sans-serif" font-weight="800" font-size="13">ROCKSIDE ACADEMY</text>
    <line x1="65" y1="89" x2="350" y2="89" stroke="#CFD8DC" stroke-dasharray="3 3"/>
    
    <text x="365" y="85" fill="#3E2723" font-family="sans-serif" font-weight="900" font-size="13">KES **${balance}.00**</text>
    
    <text x="30" y="130" fill="#546E7A" font-family="sans-serif" font-weight="bold" font-size="9" letter-spacing="0.5">FOR STUDENT/ADM </text>
    <text x="145" y="130" fill="#1A237E" font-family="monospace" font-weight="bold" font-size="12">${cleanStudent}</text>
    <line x1="135" y1="134" x2="470" y2="134" stroke="#CFD8DC" stroke-dasharray="3 3"/>
    
    <!-- Cheque validation stamp -->
    <rect x="25" y="165" width="220" height="50" fill="#E0F2F1" rx="8" stroke="#009688" stroke-width="1.5" stroke-dasharray="3"/>
    <text x="135" y="185" fill="#00695C" font-family="sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">BANK CLEARING COMPLIANT</text>
    <text x="135" y="202" fill="#546E7A" font-family="monospace" font-size="8.5" text-anchor="middle">Item Code: CHQ-${cleanRef}</text>
    
    <!-- Sign lines -->
    <text x="380" y="180" fill="#37474F" font-family="cursive" font-weight="bold" font-size="14">A. K. Mutua</text>
    <line x1="310" y1="190" x2="470" y2="190" stroke="#78909C" stroke-width="1.5"/>
    <text x="390" y="204" fill="#78909C" font-family="sans-serif" font-weight="bold" font-size="8" text-anchor="middle" letter-spacing="1">DRAWER SIGNATURE</text>
    
    <!-- MICR line at the bottom -->
    <text x="25" y="238" fill="#263238" font-family="monospace" font-size="10.5" letter-spacing="5">⑈ ${cleanRef} ⑈ 011384910 ⑈ 104820192 ⑈ 99</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Generates an SVG representation of an official school institutional rubber stamp matching the provided reference (uploaded_file_0).
 * Features solid blue rectangular outer borders, school logo mark inside, custom address lines, dater ink impression in crimson, and a signature line.
 */
export const generateClassicOfficialStamp = (
  schoolName: string,
  address: string,
  phone: string,
  email: string,
  dateStr: string = "06 MAY 2026"
): string => {
  const cleanName = (schoolName || "ROCKSIDE ACADEMY").toUpperCase();
  const cleanAddress = address || "P. O. Box 3735 - 00200, NAIROBI";
  const cleanPhone = phone || "Tel: 0718 164141, 0734808355";
  const cleanEmail = email || "info@rocksideacademy.sc.ke";
  
  // Format the date parameter beautifully for dater stamp look (e.g., "13 JUN 2026")
  let displayDate = dateStr.toUpperCase();
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const day = String(d.getDate()).padStart(2, '0');
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      displayDate = `${day} ${month} ${year}`;
    }
  } catch (e) {
    // Keep raw string if parse fails
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 260" width="100%" height="100%">
    <defs>
      <!-- Filter to simulate a slightly bleeding rubber stamp ink texture -->
      <filter id="inkBleed" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        <feGaussianBlur in="displaced" stdDeviation="0.2" result="blurred" />
        <feMerge>
          <feMergeNode in="blurred" />
          <feMergeNode in="SourceGraphic" opacity="0.3" />
        </feMerge>
      </filter>
    </defs>

    <!-- Outer Signature Frame Context (everything matches the uploaded slip stamp layout) -->
    <g filter="url(#inkBleed)">
      
      <!-- Main Stamp Royal Blue Border Box -->
      <rect x="20" y="20" width="340" height="175" rx="3" fill="none" stroke="#2563EB" stroke-width="3" stroke-opacity="0.95" />
      
      <!-- Left side logo badge (Shield graphic with books & sun rays) -->
      <g transform="translate(32, 34)" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Shield Outline -->
        <path d="M 0,0 L 26,0 C 26,0 26,18 26,24 C 26,34 13,44 13,44 C 13,44 0,34 0,24 C 0,18 0,0 0,0 Z" />
        <!-- Inner division books schematic -->
        <path d="M 4,14 L 13,18 L 22,14" />
        <path d="M 13,18 L 13,36" />
        <!-- Sun rays rising in shield top -->
        <circle cx="13" cy="8" r="3" fill="#2563EB" fill-opacity="0.2" />
        <line x1="13" y1="2" x2="13" y2="4" />
        <line x1="8" y1="4" x2="10" y2="6" />
        <line x1="18" y1="4" x2="16" y2="6" />
      </g>

      <!-- Center text lines (Header Metadata) -->
      <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle" fill="#2563EB">
        <!-- School Name -->
        <text x="210" y="44" font-size="14.5" font-weight="900" letter-spacing="0.5">${cleanName}</text>
        
        <!-- Address line -->
        <text x="210" y="59" font-size="9" font-weight="bold" letter-spacing="0.2">${cleanAddress}</text>
        
        <!-- Phone number info -->
        <text x="210" y="72" font-size="8.5" font-weight="bold" letter-spacing="0.1">${cleanPhone}</text>
      </g>

      <!-- Red Date Dater Seal in the heart of Stamp (Slightly rotated for authenticity) -->
      <g transform="translate(190, 110) rotate(-0.5)" text-anchor="middle">
        <text font-family="'Courier New', Courier, monospace" font-size="21" font-weight="900" fill="#DC2626" letter-spacing="1.5" fill-opacity="0.95">
          ${displayDate}
        </text>
      </g>

      <!-- Bottom label credentials -->
      <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle" fill="#2563EB">
        <!-- Role/Department info -->
        <text x="190" y="152" font-size="11.5" font-weight="800" letter-spacing="0.5">ADMINISTRATION MANAGER</text>
        <!-- Email address -->
        <text x="190" y="167" font-size="9" font-weight="bold">${cleanEmail}</text>
      </g>
      
    </g>

    <!-- Black Hand-Scribbled Signature overlaying/crossing the bottom border for true look -->
    <path d="M 50,225 
             Q 90,210 115,200 
             Q 130,190 142,204 
             Q 150,222 135,230 
             C 125,235 110,215 130,195 
             L 280,195 
             M 160,190 L 195,190" 
          fill="none" 
          stroke="#1E293B" 
          stroke-width="2.2" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          opacity="0.92" 
          filter="url(#inkBleed)" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Generates an SVG representation of an official Rockside Academy uniform/item fee schedule slip,
 * resembling the exact item/price sheet uploaded by the user.
 */
export const generateUniformPriceListSlipSvg = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 370" width="100%" height="100%">
    <!-- Paper Background -->
    <rect width="540" height="370" rx="12" fill="#FAFAFA" stroke="#E2E8F0" stroke-width="2"/>
    
    <!-- Header Logo Icon Shield -->
    <g transform="translate(18, 16)" stroke="#1E3A8A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M 0,0 L 32,0 C 32,0 32,22 32,29 C 32,41 16,53 16,53 C 16,53 0,41 0,29 C 0,22 0,0 0,0 Z" />
      <path d="M 5,17 L 16,22 L 27,17" />
      <path d="M 16,22 L 16,42" />
      <circle cx="16" cy="10" r="4.5" fill="#1E3A8A" fill-opacity="0.15" />
    </g>

    <!-- Header Text -->
    <text x="290" y="32" font-family="-apple-system, sans-serif" font-weight="900" font-size="20" fill="#1E3A8A" text-anchor="middle" letter-spacing="1">ROCKSIDE ACADEMY</text>
    <text x="290" y="47" font-family="-apple-system, sans-serif" font-weight="bold" font-size="8.5" fill="#1E40AF" text-anchor="middle" letter-spacing="0.2">P. O. Box 3735 - 00200 NAIROBI  TEL: 0718164141/0734808355</text>

    <!-- Underline divider -->
    <line x1="20" y1="62" x2="520" y2="62" stroke="#CBD5E1" stroke-width="1.5"/>

    <!-- Section Heading -->
    <text x="130" y="98" font-family="-apple-system, sans-serif" font-weight="800" font-size="14.5" fill="#111827" text-decoration="underline">Grad 2 Uniforms</text>

    <!-- Bullet list of items with prices and totals -->
    <g transform="translate(30, 114)" font-family="monospace" font-weight="bold" font-size="10.5" fill="#1F2937">
      <!-- Item 1 -->
      <text x="0" y="10" font-family="sans-serif" font-size="11" font-weight="700">❖  Dress</text>
      <text x="270" y="10" text-anchor="end">700/= (x2) = 1,400</text>

      <!-- Item 2 -->
      <text x="0" y="28" font-family="sans-serif" font-size="11" font-weight="700">❖  Sweater</text>
      <text x="270" y="28" text-anchor="end">900/= (x2) = 1,800</text>

      <!-- Item 3 -->
      <text x="0" y="46" font-family="sans-serif" font-size="11" font-weight="700">❖  Shirt</text>
      <text x="270" y="46" text-anchor="end">500/= (x2) = 1,000</text>

      <!-- Item 4 -->
      <text x="0" y="64" font-family="sans-serif" font-size="11" font-weight="700">❖  Socks (m)</text>
      <text x="270" y="64" text-anchor="end">200/= (x2) = 400</text>

      <!-- Item 5 -->
      <text x="0" y="82" font-family="sans-serif" font-size="11" font-weight="700">❖  Fleece</text>
      <text x="270" y="82" text-anchor="end">2,000/=</text>

      <!-- Item 6 -->
      <text x="0" y="100" font-family="sans-serif" font-size="11" font-weight="700">❖  Tracksuit (32)</text>
      <text x="270" y="100" text-anchor="end">1,500/=</text>

      <!-- Item 7 -->
      <text x="0" y="118" font-family="sans-serif" font-size="11" font-weight="700">❖  Tshirt</text>
      <text x="270" y="118" text-anchor="end">600/= (x2) = 1,200</text>

      <!-- Item 8 -->
      <text x="0" y="136" font-family="sans-serif" font-size="11" font-weight="700">❖  Bag</text>
      <text x="270" y="136" text-anchor="end">2,500/=</text>

      <!-- Item 9 -->
      <text x="0" y="154" font-family="sans-serif" font-size="11" font-weight="700">❖  Shoes Bata</text>
      <text x="270" y="154" text-anchor="end">2,499/=</text>
    </g>

    <!-- Side Official stamp mimicking classical stamp -->
    <g transform="translate(320, 155) scale(0.52)" filter="url(#inkBleed)">
      <!-- Main Stamp Royal Blue Border Box -->
      <rect x="20" y="20" width="340" height="175" rx="3" fill="none" stroke="#2563EB" stroke-width="3" stroke-opacity="0.95" />
      
      <!-- Logo badge inside stamp -->
      <g transform="translate(32, 34)" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M 0,0 L 26,0 C 26,0 26,18 26,24 C 26,34 13,44 13,44 C 13,44 0,34 0,24 C 0,18 0,0 0,0 Z" />
        <path d="M 4,14 L 13,18 L 22,14" />
        <path d="M 13,18 L 13,36" />
        <circle cx="13" cy="8" r="3" fill="#2563EB" fill-opacity="0.2" />
        <line x1="13" y1="2" x2="13" y2="4" />
      </g>

      <!-- Stamp Texts -->
      <g font-family="-apple-system, sans-serif" text-anchor="middle" fill="#2563EB">
        <text x="210" y="44" font-size="15" font-weight="900" letter-spacing="0.5">ROCKSIDE ACADEMY</text>
        <text x="210" y="59" font-size="9" font-weight="bold">P. O. Box 3735 - 00200, NAIROBI</text>
        <text x="210" y="72" font-size="8.5" font-weight="bold">Tel: 0718 164141, 0734808355</text>
      </g>

      <!-- Ink Date -->
      <text x="190" y="116" font-family="'Courier New', monospace" font-size="22" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="1.5">06 MAY 2026</text>

      <!-- Bottom designation -->
      <g font-family="-apple-system, sans-serif" text-anchor="middle" fill="#2563EB">
        <text x="190" y="152" font-size="12" font-weight="800">ADMINISTRATION MANAGER</text>
        <text x="190" y="167" font-size="9" font-weight="bold">info@rocksideacademy.sc.ke</text>
      </g>

      <!-- Signature under stamp -->
      <path d="M 50,225 Q 90,210 115,200 Q 130,190 142,204 Q 150,222 135,230 C 125,235 110,215 130,195 L 280,195 M 160,190 L 195,190" 
            fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" opacity="0.9" filter="url(#inkBleed)" />
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

