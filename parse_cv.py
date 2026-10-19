import zipfile
import xml.etree.ElementTree as ET

docx_path = "Dr_Vibhisha_CV_updated.docx"
output_path = "cv_extracted.txt"

try:
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read("word/document.xml")
    
    root = ET.fromstring(xml_content)
    namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    paragraphs = []
    for p in root.findall('.//w:p', namespaces):
        texts = [node.text for node in p.findall('.//w:t', namespaces) if node.text]
        if texts:
            paragraphs.append("".join(texts))
        else:
            paragraphs.append("")
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(paragraphs))
    
    print(f"Successfully extracted {len(paragraphs)} paragraphs to {output_path}")
except Exception as e:
    print(f"Error: {e}")
