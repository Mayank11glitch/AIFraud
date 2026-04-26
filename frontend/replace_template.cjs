const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'home.html');
const outputPath = path.join(__dirname, 'src', 'assets', 'framer_home.html');

try {
  let html = fs.readFileSync(inputPath, 'utf8');

  // Content Replacements
  const replacements = {
    "Alytics - The Perfect Saas Template": "ScamDetect AI — Fraud Detection Platform",
    "Alytics": "ScamDetect AI",
    "Turn scattered data into smart decisions": "Detect Scams & Fraud instantly with AI",
    "all-in-one analytics platform": "fraud detection platform",
    "One simple dashboard to track your SaaS growth, MRR, churn and user behavior—without the chaos.": "Our powerful multimodal AI scans screenshots, SMS, URLs, and videos to find hidden threats, deceptive patterns, and deepfakes.",
    "Trusted by 1M\\+ users": "Proactive protection against fraud",
    "Make your platform work harder for you": "Real-time threat intelligence",
    "Get Started For Free": "Start Scanning Now",
    "Start for free": "Scan Now",
    "Get Template": "Launch Scanner",
    "track performance, spot trends, and make smarter decisions faster": "detect deceptive patterns, phishing links, and social engineering tactics",
    "New Release": "Live Demo"
  };

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    html = html.replace(regex, value);
  }

  // CSS Scoping to prevent leaking to our Tailwind UI
  // Replacing `body` styles with `.framer-scope`
  html = html.replace(/html,\s*body,\s*#main\s*\{/g, '.framer-scope, .framer-scope #main {');
  html = html.replace(/body\s*\{(?![^}]*font-family:\s*sans-serif)/g, '.framer-scope {'); // ignore the generic body{font-family:sans-serif;font-size:12px} or replace it gently
  html = html.replace(/body\s*,\s*input\s*,\s*textarea\s*,\s*select\s*,\s*button\s*\{/g, '.framer-scope, .framer-scope input, .framer-scope textarea, .framer-scope select, .framer-scope button {');
  html = html.replace(/:root body\s*\{/g, '.framer-scope {');
  html = html.replace(/html body\s*\{/g, '.framer-scope {');

  // Strip scripts that might interfere / cause react hydration errors
  html = html.replace(/<script[^>]*events\.framer\.com[^>]*><\/script>/gi, '');
  
  // Extract just the parts inside <body> to insert into dangerouslySetInnerHTML,
  // plus the styles from <head>.
  const styleMatch = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
  const styles = styleMatch ? styleMatch.join('\n') : '';

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : html;

  // Let's just pass the whole HTML with the head styles intact. It will render fine as a blob.
  const finalHtml = `<div class="framer-scope">\n${styles}\n${bodyContent}\n</div>`;

  // Create assets directory if it doesn't exist
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  fs.writeFileSync(outputPath, finalHtml, 'utf8');
  console.log(`Successfully transformed template and saved to ${outputPath}`);
} catch (error) {
  console.error('Error processing template:', error);
}
