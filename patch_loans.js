
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting patch script (ESM)...");
try {
    const filePath = path.resolve('pages/Loans.tsx');
    console.log("Target file: " + filePath);

    if (!fs.existsSync(filePath)) {
        console.error("File does not exist!");
        process.exit(1);
    }

    let content = fs.readFileSync(filePath, 'utf8');
    console.log("File read. Length: " + content.length);

    // Regex for LoanViewer usage
    // Using a more flexible regex that matches <ChipSelector ... /> allowing for newlines and spaces
    // We assume the props are in the order: chips, selectedChipId, onSelect
    const oldBlockRegex = /<ChipSelector\s+chips=\{chips\}\s+selectedChipId=\{it\.chipId\}\s+onSelect=\{\(selectedChipId\)\s*=>\s*\{[\s\S]*?\}\}\s*\/>/;

    const newBlock = `<ChipSelector
                                              chips={chips}
                                              selectedChipId={it.chipId}
                                              selectedChipNumber={it.chipNumber}
                                              onSelect={(selectedChipId, selectedChipNumber) => {
                                                 if (!selectedChipId && !selectedChipNumber) {
                                                    updateItem(idx, 'chipId', undefined);
                                                    updateItem(idx, 'chipNumber', 'N/A');
                                                    return;
                                                 }
                                                 if (!selectedChipId && selectedChipNumber) {
                                                     updateItem(idx, 'chipId', undefined);
                                                     updateItem(idx, 'chipNumber', selectedChipNumber);
                                                     return;
                                                 }
                                                 const selectedChip = chips.find(c => c.id === selectedChipId);
                                                 updateItem(idx, 'chipId', selectedChipId);
                                                 updateItem(idx, 'chipNumber', selectedChip ? selectedChip.number : 'N/A');
                                              }}
                                           />`;

    if (oldBlockRegex.test(content)) {
        content = content.replace(oldBlockRegex, newBlock);
        console.log("Replaced LoanViewer ChipSelector usage.");
    } else {
        console.log("Could not find LoanViewer ChipSelector usage via regex.");
        // Debug substring
        const idx = content.indexOf('<ChipSelector');
        if (idx !== -1) {
            console.log("Found occurrence at index: " + idx);
            console.log("Context:\n" + content.substring(idx, idx + 200));
        }
    }

    // LoansPage usage
    const oldLoansPageRegex = /<ChipSelector\s+chips=\{chips\.filter\(c\s*=>\s*c\.status\s*===\s*'Disponible'\)\}\s+selectedChipId=\{it\.chipId\}\s+onSelect=\{\(selectedChipId\)\s*=>\s*\{[\s\S]*?\}\}\s*\/>/;

    const newLoansPageBlock = `<ChipSelector
                                                    chips={chips.filter(c => c.status === 'Disponible')}
                                                    selectedChipId={it.chipId}
                                                    selectedChipNumber={it.chipNumber}
                                                    onSelect={(selectedChipId, selectedChipNumber) => {
                                                       if (!selectedChipId && !selectedChipNumber) {
                                                            const ni = [...items];
                                                            ni[idx].chipId = undefined;
                                                            ni[idx].chipNumber = 'N/A';
                                                            setItems(ni);
                                                            return;
                                                       }
                                                       if (!selectedChipId && selectedChipNumber) {
                                                            const ni = [...items];
                                                            ni[idx].chipId = undefined;
                                                            ni[idx].chipNumber = selectedChipNumber;
                                                            setItems(ni);
                                                            return;
                                                       }
                                                       const selectedChip = chips.find(c => c.id === selectedChipId);
                                                       const newItems = [...items];
                                                       newItems[idx].chipId = selectedChipId;
                                                       newItems[idx].chipNumber = selectedChip ? selectedChip.number : 'N/A';
                                                       setItems(newItems);
                                                    }}
                                                 />`;

    if (oldLoansPageRegex.test(content)) {
        content = content.replace(oldLoansPageRegex, newLoansPageBlock);
        console.log("Replaced LoansPage ChipSelector usage.");
    } else {
        console.log("Could not find LoansPage ChipSelector usage via regex.");
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File written successfully.");

} catch (e) {
    console.error("Error occurred:");
    console.error(e);
    process.exit(1);
}
