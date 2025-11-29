echo [5/6] Ligando o Site (Frontend)...
:: Usa npx http-server para servir a pasta raiz na porta 5500 (igual Live Server)
:: --cors permite que o front fale com o back sem travar
:: -c-1 desabilita cache para voce ver mudancas na hora
start "SERVIDOR SITE (5500)" cmd /k "npx http-server -p 5500 -c-1 --cors"

:: --- 4. ABRIR NAVEGADOR ---
echo [6/6] Abrindo o Google Chrome...
timeout /t 3 >nul
start http://127.0.0.1:5500/html/login.html

echo.
echo ========================================================
echo                 SISTEMA ONLINE!
echo ========================================================
echo.
echo 1. Nao feche as duas janelas pretas que abriram.
echo 2. Se quiser parar, feche as janelas.
echo.
pause