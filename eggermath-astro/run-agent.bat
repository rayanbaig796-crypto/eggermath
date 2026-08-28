@echo off
echo [%date% %time%] Starting Reddit Blog Agent >> C:\Users\rayan\OneDrive\Pictures\Downloads\PRACTIC\eggermath-astro\agent.log
cd /d C:\Users\rayan\OneDrive\Pictures\Downloads\PRACTIC\eggermath-astro
node scripts/reddit-blog-agent.mjs >> C:\Users\rayan\OneDrive\Pictures\Downloads\PRACTIC\eggermath-astro\agent.log 2>&1
echo [%date% %time%] Agent finished with exit code %ERRORLEVEL% >> C:\Users\rayan\OneDrive\Pictures\Downloads\PRACTIC\eggermath-astro\agent.log
