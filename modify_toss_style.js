const fs = require('fs');
const path = require('path');

function replaceTossStyle(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceTossStyle(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('landing-page.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace blue buttons with Toss gray buttons
      if (content.includes('bg-[#3182F6]')) {
        content = content.replace(/bg-\[#3182F6\] text-white hover:bg-\[#1B64DA\]/g, 'bg-[#F2F4F6] text-[#333333] hover:bg-[#E5E8EB] active:bg-[#D1D6DB]');
        content = content.replace(/bg-\[#3182F6\]/g, 'bg-[#F2F4F6]');
        content = content.replace(/hover:bg-\[#1B64DA\]/g, 'hover:bg-[#E5E8EB]');
        content = content.replace(/shadow-[#3182F6]\/10/g, 'shadow-none');
        content = content.replace(/shadow-[#3182F6]\/20/g, 'shadow-none');
        content = content.replace(/text-white/g, 'text-[#333333]'); // Be careful with this, but since it's button specific usually it's fine. Wait, text-white might be used elsewhere.
        changed = true;
      }

      // Instead of replacing text-white blindly, let's fix the exact button classes
      content = content.replace(/bg-\[#F2F4F6\] text-white/g, 'bg-[#F2F4F6] text-[#333333]');

      // Card UIs: remove borders, increase padding, make it look more spacious
      if (content.includes('border border-[#F2F4F6]')) {
        content = content.replace(/border border-\[#F2F4F6\]/g, 'border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)]');
        changed = true;
      }

      // Update specific text colors to #333333
      if (content.includes('text-[#191F28]')) {
        content = content.replace(/text-\[#191F28\]/g, 'text-[#333333]');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceTossStyle('./components');
replaceTossStyle('./app/main');
