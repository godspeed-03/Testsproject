import re
import json
import fitz
import os

def clean_newlines(lines_list):
    res = []
    for line in lines_list:
        if not res:
            res.append(line)
        else:
            prev = res[-1]
            if re.match(r'^(\d+\.|[A-D]\.)', line) or re.search(r'[:.?]$', prev):
                res.append(line)
            else:
                res[-1] = prev + " " + line
    return "\n".join(res)

pdf_path = '../public/ancient history.pdf'
doc = fitz.open(pdf_path)

TEST_ID = "test-ancient-history-pre-upsc-cse"
OUTPUT_DIR = f'../public/{TEST_ID}'
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Extracting images...")
img_count = 1
for i, page in enumerate(doc):
    imgs = page.get_images()
    for img_idx, img in enumerate(imgs):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        img_filename = f"image{img_count}.{image_ext}"
        img_filepath = os.path.join(OUTPUT_DIR, img_filename)
        with open(img_filepath, "wb") as f:
            f.write(image_bytes)
        img_count += 1

print("Extracting text from PDF...")
lines = []
for page in doc:
    text = page.get_text()
    for line in text.split('\n'):
        line = line.strip()
        if line:
            lines.append(line)

filtered_lines = []
for line in lines:
    if line in ["Unit - A: History of India", "Ancient History", "Topicwise Solved Papers", "A", "EBD_7335"]:
        continue
    if re.match(r'^\d+$', line) and len(line) <= 2:
        continue
    filtered_lines.append(line)

try:
    hints_idx = filtered_lines.index("HINTS & SOLUTIONS")
except ValueError:
    hints_idx = -1

q_lines = filtered_lines[:hints_idx] if hints_idx != -1 else filtered_lines
a_lines = filtered_lines[hints_idx+1:] if hints_idx != -1 else []

questions = []
current_q = None
expected_q_num = 1

for line in q_lines:
    q_match = re.match(r'^(\d+)\.(?:\s+(.*))?$', line)
    opt_match = re.match(r'^(\([a-d]\))(?:\s+(.*))?$', line)
    
    is_new_question = False
    if q_match:
        num = int(q_match.group(1))
        if num == expected_q_num or num == expected_q_num + 1:
            if current_q is None or current_q.get('seen_options'):
                is_new_question = True
                expected_q_num = num + 1

    if is_new_question:
        if current_q is not None:
            questions.append(current_q)
        current_q = {'id': num, 'raw_q': [], 'seen_options': False}
        if q_match.group(2):
            current_q['raw_q'].append(q_match.group(2))
    elif opt_match:
        if current_q is not None:
            current_q['seen_options'] = True
            current_q['raw_q'].append(opt_match.group(1))
            if opt_match.group(2):
                current_q['raw_q'].append(opt_match.group(2))
    else:
        if current_q is not None:
            current_q['raw_q'].append(line)

if current_q is not None:
    questions.append(current_q)

formatted_questions = []
for q_data in questions:
    raw_q = q_data['raw_q']
    
    opt_indices = {}
    for i, line in enumerate(raw_q):
        if re.match(r'^\([a-d]\)$', line):
            opt_indices[line[1]] = i
            
    question_text = ""
    options = []
    
    if 'a' in opt_indices and 'b' in opt_indices and 'c' in opt_indices and 'd' in opt_indices:
        q_end = opt_indices['a']
        q_lines_raw = raw_q[:q_end]
        
        options.append(" ".join(raw_q[opt_indices['a']+1:opt_indices['b']]))
        options.append(" ".join(raw_q[opt_indices['b']+1:opt_indices['c']]))
        options.append(" ".join(raw_q[opt_indices['c']+1:opt_indices['d']]))
        options.append(" ".join(raw_q[opt_indices['d']+1:]))
    else:
        q_lines_raw = raw_q

    # ----- FIX FORMATTING -----
    cleaned_q = []
    i = 0
    while i < len(q_lines_raw):
        line = q_lines_raw[i]
        
        # 1. Merge List-I and List-II headers side-by-side
        if re.match(r'^List-I', line) and i+1 < len(q_lines_raw) and re.match(r'^List-II', q_lines_raw[i+1]):
            cleaned_q.append(f"{line.ljust(30)} {q_lines_raw[i+1]}")
            i += 2
            continue
            
        # 2. Merge A. Item 1. Item into a table
        if re.match(r'^[A-D]\.$', line) and i+3 < len(q_lines_raw) and re.match(r'^\d+\.$', q_lines_raw[i+2]):
            merged = f"{line.ljust(3)} {q_lines_raw[i+1].ljust(26)} {q_lines_raw[i+2].ljust(3)} {q_lines_raw[i+3]}"
            cleaned_q.append(merged)
            i += 4
            continue
            
        # 2b. General 2-column numbered list (1. Left Right)
        if re.match(r'^\d+\.$', line) and i+2 < len(q_lines_raw) and not re.match(r'^\d+\.$', q_lines_raw[i+1]) and not re.match(r'^\d+\.$', q_lines_raw[i+2]):
            is_2_col = False
            if i+3 < len(q_lines_raw) and re.match(r'^\d+\.$', q_lines_raw[i+3]):
                is_2_col = True
            elif i+3 >= len(q_lines_raw) or re.match(r'^(Which|Select|Codes)', q_lines_raw[i+3], re.I):
                if cleaned_q and re.match(r'^\d+\.\s', cleaned_q[-1]) and len(cleaned_q[-1]) > 10:
                    is_2_col = True
            
            if is_2_col:
                # Also try to format previous 2 lines as headers if they exist and are standalone
                if i >= 2 and len(cleaned_q) >= 2 and not re.match(r'^\[', cleaned_q[-1]) and not re.match(r'^\[', cleaned_q[-2]) and not re.match(r'^\d+\.\s', cleaned_q[-1]):
                    header_merged = f"{cleaned_q[-2].strip().ljust(30)} {cleaned_q[-1].strip()}"
                    cleaned_q = cleaned_q[:-2]
                    cleaned_q.append(header_merged)

                merged = f"{line.ljust(3)} {q_lines_raw[i+1].ljust(26)} {q_lines_raw[i+2]}"
                cleaned_q.append(merged)
                i += 3
                continue

        # 3. Merge 1. Statement OR 5. Right-column-item
        if re.match(r'^\d+\.$', line) and i+1 < len(q_lines_raw):
            if cleaned_q and re.match(r'^[A-D]\.\s', cleaned_q[-1]):
                # It's an extra item for List-II, indent it to match
                merged = f"{' '.ljust(30)} {line.ljust(3)} {q_lines_raw[i+1]}"
                cleaned_q.append(merged)
            else:
                # Regular statement
                cleaned_q.append(f"{line} {q_lines_raw[i+1]}")
            i += 2
            continue
            
        cleaned_q.append(line)
        i += 1

    # Clean intra-sentence newlines for the question intro text
    final_q = []
    for line in cleaned_q:
        if not final_q:
            final_q.append(line)
        else:
            prev = final_q[-1]
            if re.match(r'^([A-D]\.|\d+\.|List-|Codes:|\[\d{4}(?:-[IV]+)?\]|\s+)', line):
                final_q.append(line)
            elif re.match(r'^(Which|Select|Codes:?|In the context|With reference)', line, re.I):
                final_q.append(line)
            elif re.match(r'^\[\d{4}(?:-[IV]+)?\]$', prev.strip()):
                final_q.append(line)
            elif re.search(r'[:.?]$', prev.strip()):
                final_q.append(line)
            else:
                final_q[-1] = prev + " " + line

    question_text = "\n".join(final_q)
    # --------------------------

    q_obj = {
        "questionId": f"q{q_data['id']}",
        "type": "mcq-single",
        "question": question_text,
        "topic": "Ancient History",
        "options": options,
        "correctAnswer": [],
        "explanation": "",
        "difficulty": "medium"
    }
    
    if "map" in question_text.lower() and ("following" in question_text.lower() or "given" in question_text.lower()):
        img_idx = 1 if q_data['id'] < 40 else 2
        ext = "png" if img_idx == 1 else "jpeg"
        # Relative image paths
        q_obj["images"] = [f"/{TEST_ID}/image{img_idx}.{ext}"]
        
    formatted_questions.append(q_obj)

current_a = None
current_ans_text = []
q_map = {int(q['questionId'][1:]): q for q in formatted_questions}
expected_a_num = 1

i = 0
while i < len(a_lines):
    line = a_lines[i]
    match_combined = re.match(r'^(\d+)\.\s*\(([a-d])\)(?:\s+(.*))?$', line)
    match_single = re.match(r'^(\d+)\.$', line)
    
    is_new_answer = False
    ans_num = None
    ans_char = None
    ans_text = None
    
    if match_combined:
        num = int(match_combined.group(1))
        if num == expected_a_num or num == expected_a_num + 1:
            is_new_answer = True
            ans_num = num
            ans_char = match_combined.group(2).upper()
            ans_text = match_combined.group(3)
            expected_a_num = num + 1
    elif match_single:
        num = int(match_single.group(1))
        if num == expected_a_num or num == expected_a_num + 1:
            is_new_answer = True
            ans_num = num
            expected_a_num = num + 1
            if i + 1 < len(a_lines):
                nxt = a_lines[i+1]
                match_opt = re.match(r'^\(([a-d])\)$', nxt)
                if match_opt:
                    ans_char = match_opt.group(1).upper()
                    i += 1

    if is_new_answer:
        if current_a is not None and current_a in q_map:
            q_map[current_a]['explanation'] = clean_newlines(current_ans_text)
        
        current_a = ans_num
        if current_a in q_map and ans_char is not None:
            ans_idx = ord(ans_char) - ord('A')
            q_map[current_a]['correctAnswer'] = [ans_idx]
            
        current_ans_text = []
        if ans_text:
            current_ans_text.append(ans_text)
    else:
        if current_a is not None:
            current_ans_text.append(line)
    i += 1

if current_a is not None and current_a in q_map:
    q_map[current_a]['explanation'] = "\n".join(current_ans_text)

test_json = [
  {
    "testId": TEST_ID,
    "testName": "Ancient History",
    "description": "Comprehensive test on Ancient Indian History",
    "totalTime": 3600,
    "passingScore": 60,
    "sections": [
      {
        "sectionId": "sec-01",
        "sectionName": "Ancient History Questions",
        "sectionTime": 3600,
        "questions": formatted_questions
      }
    ]
  }
]

out_path = f'../public/test-jsons/{TEST_ID}.json'
with open(out_path, 'w') as f:
    json.dump(test_json, f, indent=2)

print(f"Extraction complete. Processed {len(formatted_questions)} questions. Saved to {out_path}")
