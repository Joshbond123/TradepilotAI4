export class LocationService {
  private static countryNames: { [key: string]: string } = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'DE': 'Germany', 
    'FR': 'France',
    'JP': 'Japan',
    'AU': 'Australia',
    'IN': 'India',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'ZA': 'South Africa',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'CN': 'China',
    'RU': 'Russia',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'SI': 'Slovenia',
    'SK': 'Slovakia',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'IE': 'Ireland',
    'LU': 'Luxembourg',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'IS': 'Iceland',
    'TR': 'Turkey',
    'IL': 'Israel',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'EG': 'Egypt',
    'MA': 'Morocco',
    'TN': 'Tunisia',
    'DZ': 'Algeria',
    'LY': 'Libya',
    'SD': 'Sudan',
    'ET': 'Ethiopia',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'RW': 'Rwanda',
    'BW': 'Botswana',
    'ZW': 'Zimbabwe',
    'ZM': 'Zambia',
    'MW': 'Malawi',
    'MZ': 'Mozambique',
    'MG': 'Madagascar',
    'MU': 'Mauritius',
    'SC': 'Seychelles',
    'KR': 'South Korea',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'BD': 'Bangladesh',
    'PK': 'Pakistan',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'MM': 'Myanmar',
    'KH': 'Cambodia',
    'LA': 'Laos',
    'BN': 'Brunei',
    'MN': 'Mongolia',
    'NZ': 'New Zealand',
    'FJ': 'Fiji',
    'PG': 'Papua New Guinea',
    'SB': 'Solomon Islands',
    'VU': 'Vanuatu',
    'NC': 'New Caledonia',
    'PF': 'French Polynesia',
    'AR': 'Argentina',
    'CL': 'Chile',
    'PE': 'Peru',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'EC': 'Ecuador',
    'BO': 'Bolivia',
    'PY': 'Paraguay',
    'UY': 'Uruguay',
    'GY': 'Guyana',
    'SR': 'Suriname',
    'GF': 'French Guiana',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'NI': 'Nicaragua',
    'HN': 'Honduras',
    'GT': 'Guatemala',
    'BZ': 'Belize',
    'SV': 'El Salvador',
    'CU': 'Cuba',
    'JM': 'Jamaica',
    'HT': 'Haiti',
    'DO': 'Dominican Republic',
    'PR': 'Puerto Rico',
    'TT': 'Trinidad and Tobago',
    'BB': 'Barbados',
    'GD': 'Grenada',
    'LC': 'Saint Lucia',
    'VC': 'Saint Vincent and the Grenadines',
    'AG': 'Antigua and Barbuda',
    'KN': 'Saint Kitts and Nevis',
    'DM': 'Dominica',
    'BS': 'Bahamas',
    'Unknown': 'Unknown'
  };

  static extractRealClientIP(req: any): string {
    // Try to extract real client IP from various headers
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
    const requestIP = req.ip || req.connection.remoteAddress;

    let userIP = '';
    
    if (forwardedFor) {
      if (typeof forwardedFor === 'string') {
        userIP = forwardedFor.split(',')[0].trim();
      } else if (Array.isArray(forwardedFor)) {
        userIP = forwardedFor[0];
      }
    } else if (realIP) {
      userIP = realIP as string;
    } else if (cfConnectingIP) {
      userIP = cfConnectingIP as string;
    } else if (requestIP) {
      if (typeof requestIP === 'string') {
        userIP = requestIP.split(',')[0].trim();
      } else if (Array.isArray(requestIP)) {
        userIP = requestIP[0];
      }
    }

    // Fallback for development/localhost
    if (!userIP || userIP === '::1' || userIP === '127.0.0.1' || userIP.includes('localhost') || userIP.startsWith('172.') || userIP.startsWith('10.') || userIP.startsWith('192.168.')) {
      userIP = '8.8.8.8'; // Use Google DNS as fallback for testing
    }

    return userIP;
  }

  static async detectUserCountry(ip: string): Promise<string> {
    // Handle internal/localhost IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost') || ip.startsWith('172.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
      return "United States"; // Default for local/internal IPs
    }

    // Use ipinfo.io API with provided token for accurate country detection
    try {
      const response = await fetch(`https://ipinfo.io/${ip}?token=6947dad7055b04`);
      if (response.ok) {
        const data = await response.json();
        if (data.bogon) {
          // Handle bogon (internal) IPs
          return "United States";
        }
        const countryCode = data.country || "US";
        // Return full country name instead of country code
        return this.countryNames[countryCode] || countryCode;
      }
    } catch (error) {
      console.error("Failed to detect country:", error);
    }
    return "United States"; // Default fallback
  }

  static detectTimezone(): string {
    // Get timezone from browser or use UTC as fallback
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }

  static getCountryName(countryCode: string): string {
    return this.countryNames[countryCode] || countryCode;
  }
}