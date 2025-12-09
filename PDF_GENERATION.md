# PDF Generation Guide

## Option 1: Using Pandoc (Recommended)
```bash
# Install pandoc and texlive
sudo apt update
sudo apt install pandoc texlive-latex-base texlive-fonts-recommended texlive-extra-utils texlive-latex-extra

# Convert markdown to PDF
pandoc REPORT.md -o BalanceSheetPro_Report.pdf --pdf-engine=pdflatex
```

## Option 2: Using Markdown PDF VS Code Extension
1. Install "Markdown PDF" extension in VS Code
2. Open REPORT.md
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Markdown PDF: Export (pdf)"
5. Save as `BalanceSheetPro_Report.pdf`

## Option 3: Online Converters
- Use https://www.markdowntopdf.com/
- Upload REPORT.md and download PDF

## Option 4: GitHub Pages (Alternative)
```bash
# Create a GitHub Pages branch
git checkout -b gh-pages
cp REPORT.md index.md
git add index.md
git commit -m "Add report for GitHub Pages"
git push origin gh-pages
```
Then access at: https://danieltn889.github.io/BalanceSheetPro/

## Final PDF Checklist
- [ ] All sections included (1-12)
- [ ] Screenshots descriptions present
- [ ] Tables properly formatted
- [ ] Code blocks readable
- [ ] Page count under 10 pages
- [ ] Professional formatting
- [ ] All links working
- [ ] GitHub repository link included