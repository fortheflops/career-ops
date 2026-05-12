import fs from 'fs';
import path from 'path';

const pipelinePath = 'data/pipeline.md';
const appsPath = 'data/applications.md';

function parsePipeline() {
  const content = fs.readFileSync(pipelinePath, 'utf8');
  const lines = content.split('\n');
  const apps = [];
  
  // Regex for processed lines: - [x] #183 | URL | Company | Role | Score | PDF
  const processedRegex = /- \[x\] #(\d+) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| (.*)/;
  
  for (const line of lines) {
    const match = line.match(processedRegex);
    if (match) {
      const [_, num, url, company, role, score, rest] = match;
      // Find report link in the same directory if possible
      const reportFile = fs.readdirSync('reports').find(f => f.startsWith(num.padStart(3, '0')));
      const report = reportFile ? `[${parseInt(num)}](reports/${reportFile})` : '';
      
      apps.push({
        num: parseInt(num),
        date: '2026-05-09', // Placeholder date
        company: company.trim(),
        role: role.trim(),
        score: score.trim(),
        status: 'Evaluated',
        pdf: rest.includes('PDF') ? '✅' : '',
        report: report,
        notes: ''
      });
    }
  }
  return apps;
}

function parseReports() {
  const reports = fs.readdirSync('reports').filter(f => f.endsWith('.md') && /^\d+/.test(f));
  const apps = [];
  
  for (const file of reports) {
    const num = parseInt(file.match(/^(\d+)/)[1]);
    const content = fs.readFileSync(path.join('reports', file), 'utf8');
    
    // Try to extract company/role from header
    // Usually: # Report: Company - Role
    const headerMatch = content.match(/# (?:Report: )?(.*?) - (.*)/);
    const company = headerMatch ? headerMatch[1].trim() : 'Unknown';
    const role = headerMatch ? headerMatch[2].split('\n')[0].trim() : 'Unknown';
    
    // Score is usually in a table or bold
    const scoreMatch = content.match(/Score: \*\*([\d.]+)\/5\*\*/i) || content.match(/Score: ([\d.]+)\/5/i);
    const score = scoreMatch ? `${scoreMatch[1]}/5` : 'N/A';
    
    apps.push({
      num,
      date: '2026-05-09',
      company,
      role,
      score,
      status: 'Evaluated',
      pdf: '✅',
      report: `[${num}](reports/${file})`,
      notes: ''
    });
  }
  return apps;
}

const pipelineApps = parsePipeline();
const reportApps = parseReports();

// Merge and dedup by ID
const allApps = new Map();
[...reportApps, ...pipelineApps].forEach(app => {
  if (!allApps.has(app.num) || (allApps.get(app.num).company === 'Unknown' && app.company !== 'Unknown')) {
    allApps.set(app.num, app);
  }
});

const sortedApps = Array.from(allApps.values()).sort((a, b) => a.num - b.num);

let output = '# Applications Tracker\n\n| # | Date | Company | Role | Score | Status | PDF | Report | Notes |\n|---|------|---------|------|-------|--------|-----|--------|-------|\n';
sortedApps.forEach(app => {
  output += `| ${app.num} | ${app.date} | ${app.company} | ${app.role} | ${app.score} | ${app.status} | ${app.pdf} | ${app.report} | ${app.notes} |\n`;
});

fs.writeFileSync(appsPath, output);
console.log(`Rebuilt tracker with ${sortedApps.length} entries.`);
