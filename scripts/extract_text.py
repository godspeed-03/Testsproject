import fitz
import os

pdf_path = '../public/ancient history.pdf'
doc = fitz.open(pdf_path)

full_text = ""
for page in doc:
    full_text += page.get_text()

with open('full_text.txt', 'w') as f:
    f.write(full_text)
