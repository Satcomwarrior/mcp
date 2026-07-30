export function validateUrlProtocol(url: string): string {
    let finalUrl = url;

    if (!finalUrl.includes("://")) {
        try {
            const testUrl = new URL(finalUrl);
            if (testUrl.protocol && testUrl.protocol !== 'http:' && testUrl.protocol !== 'https:' && testUrl.protocol !== 'localhost:') {
                throw new Error(`Invalid URL protocol: ${testUrl.protocol}. Only http and https are allowed.`);
            }
            if (testUrl.protocol === 'localhost:') {
                finalUrl = 'https://' + finalUrl;
            }
        } catch (error: any) {
             if (error.code === 'ERR_INVALID_URL') {
                 finalUrl = 'https://' + finalUrl;
             } else {
                 throw error;
             }
        }
    }

    try {
        const parsedUrl = new URL(finalUrl);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
             throw new Error(`Invalid URL protocol: ${parsedUrl.protocol}. Only http and https are allowed.`);
        }
    } catch (error: any) {
         if (error.code === 'ERR_INVALID_URL') {
             throw new Error("Invalid URL format");
         }
         throw error;
    }

    return finalUrl;
}
