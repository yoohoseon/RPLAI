const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Change headers if it has bg-white/something to just plain bg-white or bg-[#F9FAFB]
    // Update blue primary button pattern to Toss app style secondary primary button
    // Replace EXACT patterns to be safe

    content = content.replace(/bg-\[#3182F6\]/g, 'bg-[#F2F4F6]');
    content = content.replace(/text-white hover:bg-\[#1B64DA\]/g, 'text-[#333333] hover:bg-[#E5E8EB] active:bg-[#D1D6DB]');
    content = content.replace(/hover:bg-\[#1B64DA\] text-white/g, 'hover:bg-[#E5E8EB] text-[#333333] active:bg-[#D1D6DB]');

    // Shadow removals or soften for the buttons
    content = content.replace(/shadow-lg shadow-\[#3182F6\]\/10/g, 'shadow-none');
    content = content.replace(/shadow-md shadow-\[#3182F6\]\/10/g, 'shadow-none');
    content = content.replace(/shadow-\[#3182F6\]\/20/g, 'shadow-none');

    // Other blue text elements
    content = content.replace(/text-\[#3182F6\]/g, 'text-[#333333]');
    content = content.replace(/bg-\[#3182F6\]\/5/g, 'bg-[#F2F4F6]');
    content = content.replace(/bg-\[#3182F6\]\/10/g, 'bg-[#E5E8EB]');

    // Update card UI logic 
    // from: border border-[#F2F4F6] Or border-[#E5E8EB]
    content = content.replace(/border border-\[#F2F4F6\]/g, 'border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)]');
    content = content.replace(/border-\[#F2F4F6\]/g, 'border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)]');

    // Text colors
    content = content.replace(/text-\[#191F28\]/g, 'text-[#333333]');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.tsx') && !fullPath.includes('landing-page.tsx')) {
            processFile(fullPath);
        }
    }
}

traverseDir('./components');
traverseDir('./app/main');
traverseDir('./app/(auth)');

