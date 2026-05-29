import re
import json
import fitz
import os

pdf_path = '../public/ancient history.pdf'
doc = fitz.open(pdf_path)

TEST_ID = "test-ancient-history"
OUTPUT_DIR = f'../public/{TEST_ID}'
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
        # Ensure it's sequentially close to the expected question number
        if num == expected_q_num or num == expected_q_num + 1:
            is_new_question = True
            expected_q_num = num + 1

    if is_new_question:
        if current_q is not None:
            questions.append(current_q)
        current_q = {'id': num, 'raw_q': []}
        if q_match.group(2):
            current_q['raw_q'].append(q_match.group(2))
    elif opt_match:
        if current_q is not None:
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
        question_text = "\n".join(raw_q[:q_end])
        options.append("\n".join(raw_q[opt_indices['a']+1:opt_indices['b']]))
        options.append("\n".join(raw_q[opt_indices['b']+1:opt_indices['c']]))
        options.append("\n".join(raw_q[opt_indices['c']+1:opt_indices['d']]))
        options.append("\n".join(raw_q[opt_indices['d']+1:]))
    else:
        question_text = "\n".join(raw_q)

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
        q_obj["images"] = [f"https://test.nxtdev.in/{TEST_ID}/image{img_idx}.{ext}"]
        
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
            q_map[current_a]['explanation'] = "\n".join(current_ans_text)
        
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

with open(f'../public/{TEST_ID}.json', 'w') as f:
    json.dump(test_json, f, indent=2)

print(f"Extraction complete. Processed {len(formatted_questions)} questions.")
