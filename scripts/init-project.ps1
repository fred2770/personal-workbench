$ErrorActionPreference = "Stop"
$ProjectRoot = "E:\project\personal-workbench"

Write-Host "========== Personal Workbench 初始化 ==========" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $ProjectRoot | Out-Null
Set-Location $ProjectRoot

if (-not (Test-Path ".git")) { git init }

Write-Host "========== Git =========="
git --version
git status

Write-Host "========== 环境 =========="
try { node --version } catch { Write-Host "Node.js 未检测到" -ForegroundColor Yellow }
try { npm --version } catch { Write-Host "npm 未检测到" -ForegroundColor Yellow }
try { python --version } catch { Write-Host "Python 未检测到" -ForegroundColor Yellow }

Write-Host "========== 下一步 ==========" -ForegroundColor Cyan
Write-Host "把启动包内容复制到 $ProjectRoot，然后用 Codex 打开该目录。"
Write-Host "把 FIRST_CODEX_PROMPT.txt 全文发送给 Codex。" -ForegroundColor Green
