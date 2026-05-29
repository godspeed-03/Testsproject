import fitz
import json
import re
import os

TEST_ID = "test-ancient-history-pre-upsc-cse"
PDF_PATH = '/mnt/DED2D203D2D1E037/Testsproject/public/ancient history.pdf'
JSON_PATH = f'/mnt/DED2D203D2D1E037/Testsproject/public/test-jsons/{TEST_ID}.json'
OUTPUT_DIR = f'/mnt/DED2D203D2D1E037/Testsproject/public/{TEST_ID}'

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load JSON
with open(JSON_PATH, 'r') as f:
    test_json = json.load(f)

formatted_questions = test_json[0]["sections"][0]["questions"]

# We will look for complex questions
complex_q_ids = []
for q in formatted_questions:
    text = q["question"]
    # Conditions for complex question:
    # 1. Contains "List-I" and "List-II"
    # 2. Contains "consider the following"
    # 3. Contains "Match the following"
    if "List-I" in text or "List-II" in text or "consider the following" in text.lower() or "match the following" in text.lower():
        complex_q_ids.append(int(q["questionId"][1:]))

print(f"Found {len(complex_q_ids)} complex questions: {complex_q_ids}")

doc = fitz.open(PDF_PATH)

# To find where each question starts, we scan all pages
q_locations = {} # q_num -> (page_idx, y0)

for page_idx in range(len(doc)):
    page = doc[page_idx]
    blocks = page.get_text("dict")["blocks"]
    
    # We want to find the exact block where a question starts
    for b in blocks:
        if "lines" not in b: continue
        for l in b["lines"]:
            for s in l["spans"]:
                text = s["text"].strip()
                match = re.match(r'^(\d+)\.', text)
                if match:
                    q_num = int(match.group(1))
                    # Only save the first time we see it on the page to avoid matching options or text
                    # Wait, we need to be sure it's at the start of a line
                    if q_num not in q_locations:
                        # Sometimes answer keys or hints have "1." etc, but they are after hints_idx
                        # We just record all occurrences and filter later. Or assume the first is the question.
                        q_locations[q_num] = (page_idx, s["bbox"][1]) # y0
                        
# Now we extract images for the complex questions
for q_num in complex_q_ids:
    if q_num not in q_locations:
        print(f"Warning: Could not find location for Q{q_num}")
        continue
        
    page_idx, y0 = q_locations[q_num]
    page = doc[page_idx]
    
    # Find where it ends
    # It ends at q_num + 1, OR end of page
    y1 = page.rect.height
    
    if (q_num + 1) in q_locations:
        nxt_page_idx, nxt_y0 = q_locations[q_num + 1]
        if nxt_page_idx == page_idx:
            y1 = nxt_y0
        else:
            # next question is on the next page.
            pass
            
    # Add safety check for dimensions
    if y1 <= y0:
        print(f"Warning: y1 ({y1}) <= y0 ({y0}) for Q{q_num}. Setting y1 = page.rect.height")
        y1 = page.rect.height

    # Crop the image
    # We add a little padding
    rect = fitz.Rect(0, max(0, y0 - 10), page.rect.width, min(page.rect.height, y1))
    
    if rect.is_empty or rect.width <= 0 or rect.height <= 0:
        print(f"Warning: Invalid rect for Q{q_num}: {rect}")
        continue
        
    pix = page.get_pixmap(clip=rect, dpi=150)
    
    img_filename = f"q{q_num}_crop.png"
    img_filepath = os.path.join(OUTPUT_DIR, img_filename)
    pix.save(img_filepath)
    
    # Update JSON
    for q in formatted_questions:
        if q["questionId"] == f"q{q_num}":
            if "images" not in q:
                q["images"] = []
            img_url = f"/{TEST_ID}/{img_filename}"
            if img_url not in q["images"]:
                q["images"].append(img_url)
            break

with open(JSON_PATH, 'w') as f:
    json.dump(test_json, f, indent=2)

print("Finished cropping images and updating JSON!")
