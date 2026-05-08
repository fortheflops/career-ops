import fs from 'fs';
import yaml from 'js-yaml';
import { chromium } from 'playwright';

async function scan() {
    const portals = yaml.load(fs.readFileSync('config/portals.yml', 'utf8'));
    const history = fs.readFileSync('data/scan-history.tsv', 'utf8').split('\n').map(l => l.split('\t')[0]);
    const pipeline = fs.readFileSync('data/pipeline.md', 'utf8');
    const applications = fs.readFileSync('data/applications.md', 'utf8');

    const browser = await chromium.launch();
    const page = await browser.newPage();

    const results = [];
    const topCompanies = portals.tracked_companies.slice(0, 5);

    for (const company of topCompanies) {
        if (!company.enabled || !company.careers_url) continue;

        console.log(`Scanning ${company.name}...`);
        try {
            await page.goto(company.careers_url, { waitUntil: 'networkidle' });
            
            // This is a generic attempt to find job links. 
            // In a real scenario, we'd tailor this per portal.
            const links = await page.evaluate(() => {
                const allLinks = Array.from(document.querySelectorAll('a'));
                return allLinks
                    .filter(a => a.href.includes('job') || a.href.includes('career') || a.innerText.toLowerCase().includes('apply'))
                    .map(a => ({ title: a.innerText.trim(), url: a.href }));
            });

            for (const link of links) {
                if (link.title && link.url) {
                    results.push({ company: company.name, title: link.title, url: link.url });
                }
            }
        } catch (e) {
            console.error(`Error scanning ${company.name}: ${e.message}`);
        }
    }

    await browser.close();

    // Filtering
    const positive = portals.title_filter.positive;
    const negative = portals.title_filter.negative;

    const filtered = results.filter(r => {
        const title = r.title.toLowerCase();
        const hasPositive = positive.some(p => title.includes(p.toLowerCase()));
        const hasNegative = negative.some(n => title.includes(n.toLowerCase()));
        return hasPositive && !hasNegative;
    });

    // Deduplication
    const newOffers = filtered.filter(r => {
        if (history.includes(r.url)) return false;
        if (pipeline.includes(r.url)) return false;
        if (applications.includes(r.url)) return false;
        return true;
    });

    // Save to pipeline.md
    if (newOffers.length > 0) {
        let pipelineContent = fs.readFileSync('data/pipeline.md', 'utf8');
        const pendingHeader = '## Pendientes';
        const headerIndex = pipelineContent.indexOf(pendingHeader);
        
        let newEntries = newOffers.map(o => `- [ ] ${o.url} | ${o.company} | ${o.title}`).join('\n');
        
        if (headerIndex !== -1) {
            const before = pipelineContent.substring(0, headerIndex + pendingHeader.length + 1);
            const after = pipelineContent.substring(pipelineContent.indexOf('\n', headerIndex + pendingHeader.length));
            fs.writeFileSync('data/pipeline.md', `${before}\n${newEntries}${after}`);
        } else {
            fs.appendFileSync('data/pipeline.md', `\n\n## Pendientes\n${newEntries}\n`);
        }

        // Log to history
        const date = new Date().toISOString().split('T')[0];
        const historyEntries = newOffers.map(o => `${o.url}\t${date}\tPlaywright\t${o.title}\t${o.company}\tadded`).join('\n');
        fs.appendFileSync('data/scan-history.tsv', `\n${historyEntries}`);
    }

    console.log(`Scan complete. Found ${results.length} total, ${filtered.length} filtered, ${newOffers.length} new.`);
}

scan().catch(console.error);
