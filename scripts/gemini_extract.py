import os
import fitz # PyMuPDF
import json
from google import genai
from google.genai import types
from PIL import Image
import io


# Initialize the client
client = genai.Client(api_key=API_KEY)

# Open the PDF and get page 6 (0-indexed page 5) - page 6 has the "Which of the following pairs" and "Match List-I"
pdf_path = "../public/ancient history.pdf"
doc = fitz.open(pdf_path)
page = doc[5] # Try page 6 (index 5)
pix = page.get_pixmap(dpi=150)
img = Image.open(io.BytesIO(pix.tobytes("png")))

prompt = """
Extract all multiple choice questions from this page into a JSON array. 
The JSON array should contain objects with the following keys:
- questionId (e.g. "q1")
- type ("mcq-single" or "mcq-multiple")
- topic ("Ancient History")
- question (The full question text. Ensure complex table structures like 'Match the following' are preserved accurately or formatted nicely as text)
- options (Array of 4 string options)
- correctAnswers (Array of the correct option strings. Leave empty if no correct answer is given on this page)
- explanation (The explanation text if present. Leave empty string if not present)

Return ONLY valid JSON array.
"""

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        img,
        prompt
    ],
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.0
    )
)

print(response.text)
