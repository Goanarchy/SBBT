@echo off
title Push SBBT to GitHub
echo ======================================================================
echo  Uploading SBBT (Master Business Dashboard v1.2.4 BETA) to GitHub
echo  Repository: https://github.com/Goanarchy/SBBT
echo ======================================================================
echo.
echo Connecting to GitHub and pushing main branch...
echo.
"C:\Users\Andrés Montoya\AppData\Local\Programs\Git\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================================
    echo  SUCCESS! Repository successfully pushed to GitHub:
    echo  https://github.com/Goanarchy/SBBT
    echo ======================================================================
) else (
    echo ======================================================================
    echo  If prompted, use your GitHub username (Goanarchy) and Personal Access
    echo  Token (PAT) as password, or authorize via your browser.
    echo ======================================================================
)
echo.
pause
