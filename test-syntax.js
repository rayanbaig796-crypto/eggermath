const fs = require('fs');
const acorn = require('acorn');
const vm = require('vm');

const s = fs.readFileSync('server.js', 'utf8');

// Find the adBlockerScript assignment and extract just the concatenated string
const startMarker = "var adBlockerScript = '<script>'";
const startIdx = s.indexOf(startMarker);
if (startIdx === -1) { console.log('Start marker not found'); process.exit(1); }

// Find the end: the line with })()</script>';
const endMarker = "})()</script>'";
const endIdx = s.indexOf(endMarker, startIdx);
if (endIdx === -1) { console.log('End marker not found'); process.exit(1); }

const chunk = s.substring(startIdx, endIdx + endMarker.length);

// Build a small script that assigns the string
const testScript = chunk + '\nprocess.stdout.write(adBlockerScript);';

// Run it to get the actual string value
try {
  const output = [];
  const sandbox = {
    process: { stdout: { write: function(s) { output.push(s); } } }
  };
  // Use a different approach - just eval the assignment
  const scriptBody = "var adBlockerScript = '<script>'" + 
    chunk.substring(chunk.indexOf("'<script>'") + "'<script>'".length, chunk.lastIndexOf(endMarker)) +
    endMarker.replace(";", "");
  
  // Simpler: just run the lines to build the string
  const context = vm.createContext({ process: { stdout: { write: function(s) { output.push(s); } } } });
  
  // Extract lines with + '...' and build evaluable expression
  const lines = chunk.split('\n');
  let expr = "'<script>'";
  for (const line of lines) {
    const m = line.match(/^\s*\+\s*('(?:[^'\\]|\\.)*')\s*$/);
    if (m) {
      expr += ' + ' + m[1];
    }
  }
  
  vm.runInContext('var result = ' + expr, context);
  const adBlockerScript = context.result;
  
  // Strip <script> tags
  const jsCode = adBlockerScript.replace(/^<script>/, '').replace(/<\/script>$/, '');
  
  // Wrap in IIFE to simulate browser execution
  const fullCode = '(function(){' + jsCode + '})()';
  
  acorn.parse(fullCode, { ecmaVersion: 2020, sourceType: 'script' });
  console.log('VALID - ad blocker script parses correctly (' + fullCode.length + ' chars)');
} catch (e) {
  console.error('ERROR:', e.message);
  if (e.pos !== undefined) {
    // Reconstruct for context
    const lines = chunk.split('\n');
    let expr = "'<script>'";
    for (const line of lines) {
      const m = line.match(/^\s*\+\s*('(?:[^'\\]|\\.)*')\s*$/);
      if (m) expr += ' + ' + m[1];
    }
    const context = vm.createContext({});
    vm.runInContext('var result = ' + expr, context);
    const jsCode = context.result.replace(/^<script>/, '').replace(/<\/script>$/, '');
    const fullCode = '(function(){' + jsCode + '})()';
    console.error('Context:', JSON.stringify(fullCode.substring(Math.max(0, e.pos - 80), e.pos + 80)));
  }
  process.exit(1);
}
