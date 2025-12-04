pushd "%~dp0" || exit /B
start cmd.exe /k "cd /d \"%~dp0backend\" && uvicorn inventoryApi:app --reload"
cd my-app
start cmd.exe /k "npm run dev"
popd
