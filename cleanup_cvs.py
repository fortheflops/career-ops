import os
import re
import glob

# Configuration
TMP_DIR = 'tmp'
PORTFOLIO_PATTERN = re.compile(r'<span class="separator">\|</span>\s*<a href="#">Portfolio</a>', re.MULTILINE)
PORTFOLIO_TRAILING_SEP = re.compile(r'<span class="separator">\|</span>', re.MULTILINE) # This might be too aggressive

# Exact replacements for DCSA content
REPLACEMENTS = [
    (
        r'driving cost efficiencies at DCSA',
        'enhancing operational compliance at DCSA'
    ),
    (
        r'<li><strong>Translates operational problems into data problems</strong> by leveraging quantitative modeling to identify process gaps, driving significant cost efficiencies in agency workflows\.</li>',
        '<li><strong>Supported compliance operations</strong> by managing large datasets, identifying gaps in processes, and maintaining a high standard of written communication for internal stakeholders.</li>'
    ),
    (
        r'<li>Synthesizes complex intelligence and operational data into strategic briefings for agency leadership to inform executive decision-making\.</li>',
        '<li><strong>Supported federal compliance operations</strong> and organizational initiatives by securely managing large datasets of sensitive personnel records and adhering to strict ethical standards.</li>'
    ),
    (
        r'resulting in a strategic proposal for cost reduction in background investigation processing',
        'resulting in a strategic proposal for process optimization in background investigation processing'
    )
]

def clean_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Remove Portfolio Link and the separator before it
    content = PORTFOLIO_PATTERN.sub('', content)
    
    # If the portfolio was the middle item, we might have left a trailing separator.
    # But let's check the structure:
    # <span>Email</span> <sep> <a>LinkedIn</a> <sep> <a>Portfolio</a> <sep> <span>Location</span>
    # After removing <sep> Portfolio, we have:
    # <span>Email</span> <sep> <a>LinkedIn</a> <sep> <span>Location</span>
    # This is actually correct.
    
    # 2. Apply DCSA replacements
    for old, new in REPLACEMENTS:
        content = re.sub(old, new, content)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    files = glob.glob(os.path.join(TMP_DIR, '*.html'))
    count = 0
    for f in files:
        if clean_file(f):
            count += 1
    print(f"Cleaned {count} files in {TMP_DIR}")

if __name__ == '__main__':
    main()
