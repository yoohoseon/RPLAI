const fs = require('fs');
const path = require('path');

function cleanMessyClasses(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            cleanMessyClasses(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Clean up messy multi-shadows
            content = content.replace(/shadow-\[0_2px_20px_rgba\(0,0,0,0\.04\)\] shadow-\[0_2px_20px_rgba\(0,0,0,0\.04\)\]/g, 'shadow-[0_2px_20px_rgba(0,0,0,0.04)]');
            content = content.replace(/border-none shadow-\[0_2px_24px_rgba\(0,0,0,0\.04\)\] bg-white shadow-\[0_8px_30px_rgba\(0,0,0,0\.04\)\]/g, 'border-none bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)]');
            content = content.replace(/border-none shadow-\[0_2px_20px_rgba\(0,0,0,0\.04\)\] shadow-sm/g, 'border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)]');
            content = content.replace(/shadow-lg shadow-none/g, 'shadow-none');
            content = content.replace(/border-none shadow-\[0_2px_20px_rgba\(0,0,0,0\.04\)\] bg-white/g, 'border-none bg-white');
            content = content.replace(/border-none shadow-\[0_2px_24px_rgba\(0,0,0,0\.04\)\] shadow-xl/g, 'border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)]');
            content = content.replace(/border-b border-none shadow-\[0_2px_24px_rgba\(0,0,0,0\.04\)\]/g, 'border-none');
            content = content.replace(/border-none shadow-\[0_2px_24px_rgba\(0,0,0,0\.04\)\]/g, 'border-none');
            content = content.replace(/border-none shadow-\[0_2px_30px_rgba\(0,0,0,0\.04\)\]/g, 'border-none');
            content = content.replace(/border-none shadow-\[0_2px_20px_rgba\(0,0,0,0\.04\)\]/g, 'border-none');
            content = content.replace(/border-t border-none/g, 'border-none');
            content = content.replace(/bg-\[#F9FAFB\]/g, 'bg-[#F2F4F7]'); // Global light gray bg if any left
            content = content.replace(/bg-white border-none shadow-sm/g, 'bg-white border-none shadow-[0_2px_10px_rgba(0,0,0,0.04)]');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

cleanMessyClasses('./components');
cleanMessyClasses('./app/main');
cleanMessyClasses('./app/(auth)');
