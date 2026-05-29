import google.generativeai as genai
import os

api_key = "AQ.Ab8RN6JpIANNdgtrdJNP5ijDscMcvUT9tlbEqdDI5Y362jZWzw" 
# wait, AIza is standard. Let's see if this works.
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello")
    print("Success:", response.text)
except Exception as e:
    print("Error:", e)
