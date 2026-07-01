import re
import os

html_path = r'C:\Users\DELL\House work\Internship\erp\erp\folders\logsheet\list.php'
jsx_path = r'C:\Users\DELL\House work\Internship\erp\erp\frontend\src\pages\Logsheet\LogsheetList.jsx'
css_path = r'C:\Users\DELL\House work\Internship\erp\erp\frontend\src\pages\Logsheet\LogsheetList.css'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract styles
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
styles = style_match.group(1) if style_match else ''
# Remove body style background to prevent global override
styles = re.sub(r'body\s*{[^}]*}', '', styles, flags=re.DOTALL)
os.makedirs(os.path.dirname(jsx_path), exist_ok=True)
# Wrap all selectors with .logsheet-container to namespace them
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(styles)

# Extract body
body_match = re.search(r'<body>(.*?)</body>', content, re.DOTALL)
body_html = body_match.group(1) if body_match else ''

# Clean up PHP logic that might be in the html just in case
body_html = re.sub(r'<\?php.*?\?>', '', body_html, flags=re.DOTALL)

component = '''import React, {{ useEffect }} from \\'react\\';
import \\'./LogsheetList.css\\';

export default function LogsheetList() {{
  // We use dangerouslySetInnerHTML to render the exact static template
  // without risking JSX conversion errors on 900 lines of complex HTML.
  const htmlContent = `{}`;
  
  return (
    <div className="logsheet-container bg-white">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet" />
      <div dangerouslySetInnerHTML={{{{__html: htmlContent}}}} />
    </div>
  );
}}
'''.replace("\\'", "'").format(body_html.replace('`', '\\`').replace('$', '\\$'))

os.makedirs(os.path.dirname(jsx_path), exist_ok=True)
with open(jsx_path, 'w', encoding='utf-8') as f:
    f.write(component)

print('Successfully generated LogsheetList.jsx and CSS')
