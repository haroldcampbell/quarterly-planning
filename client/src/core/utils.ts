// https://stackoverflow.com/questions/1199352/smart-way-to-truncate-long-strings
export function truncate(str: string, n: number) {
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
}

export function pluralizer(
    singularStr: string,
    pluralStr: string,
    n: number
): string {
    const text = n == 1 ? singularStr : pluralStr;

    return `${n} ${text}`;
}

/**
 * Searches for and removes an item from a list.
 * @param list The list to search
 * @param item The value to locate in the specified list.
 * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
 *
 * @returns True if found. Returns false otherwise.
 */
export function removeListItem < T > (list: Array < T > , item: T, fromIndex ? : number): boolean {
    const index = list.indexOf(item, fromIndex);

    if (index == -1) {
        return false;
    }

    list.splice(index, 1);
    return true;
}

type localesType = string | string[] | undefined;
// https://stackoverflow.com/questions/11665884/how-can-i-parse-a-string-with-a-comma-thousand-separator-to-a-number
export function parseNumber(value: any, locales ? : localesType): number {
    try {
        if (locales == undefined) {
            locales = navigator.languages as string[]
        }
        const example = Intl.NumberFormat(locales).format(1.1);
        const cleanPattern = new RegExp(`[^-+0-9${ example.charAt( 1 ) }]`, 'g');
        const cleaned = value.replace(cleanPattern, '');
        const normalized = cleaned.replace(example.charAt(1), '.');

        return parseFloat(normalized);

    } catch (error) {
        console.trace("[parseNumber] Error processing value: ", value, error)
    }
    return NaN
}

export function ensurePrettyNumber(value: number) {
    if (Number.isInteger(value)) {
        return value;
    }

    return Number.parseFloat(value.toString()).toFixed(2);
}

export type RateLimiterCallback = (wait:number, func:() => void) => void;

export function createRateLimiter(context:any) : RateLimiterCallback {
        let timeout: number | undefined;

        return function (wait:number, func:() => void) {
            const later = function () {
                timeout = undefined;
                func.apply(context);
            };
            clearTimeout(timeout);
            timeout = window.setTimeout(later, wait);
        };
    };