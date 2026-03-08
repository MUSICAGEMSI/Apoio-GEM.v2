@echo off
chcp 65001 > nul
echo === Deploy ApoioGEM ===
cd /d "C:\Users\paulo\OneDrive\Documentos\ANGULAR-APOIOGEM\angular-migration"

echo [1/5] Removendo index.lock...
if exist ".git\index.lock" del /f ".git\index.lock"

echo [2/5] Escrevendo arquivos via Python...
python _deploy_write.py
if errorlevel 1 (
  echo ERRO: Python nao encontrado. Tentando python3...
  python3 _deploy_write.py
)

echo [3/5] Removendo node_modules do git tracking...
git rm -r --cached node_modules > nul 2>&1
git rm -r --cached dist > nul 2>&1
git rm -r --cached .angular > nul 2>&1

echo [4/5] Commit...
git add -A
git commit -m "feat: personalizado chips + musicalizacao topo + fix gitignore"

echo [5/5] Push...
git push origin main --force

echo.
echo === Pronto! Vercel vai fazer o redeploy. ===
del _deploy_write.py
pause