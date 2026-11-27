# Instala o app de laudos no computador e cria o atalho com a logo na área de trabalho.
# Os laudos ficam guardados no navegador; reinstalar (para atualizar) não apaga nada.
$ErrorActionPreference = 'Stop'
$origem = Split-Path -Parent $MyInvocation.MyCommand.Path
$destino = Join-Path $env:LOCALAPPDATA 'Wilton Rocha Laudos'
New-Item -ItemType Directory -Force $destino | Out-Null
Copy-Item (Join-Path $origem 'Wilton Rocha - Laudos.html') $destino -Force
Copy-Item (Join-Path $origem 'app.ico') $destino -Force
$html = Join-Path $destino 'Wilton Rocha - Laudos.html'
$ico = Join-Path $destino 'app.ico'

# Abre numa janela própria do Edge (sem barra de endereço), como um programa; sem Edge, abre no navegador padrão
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1

$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$menu = Join-Path ([Environment]::GetFolderPath('Programs')) 'Wilton Rocha - Laudos.lnk'
foreach ($lnk in @((Join-Path $desktop 'Wilton Rocha - Laudos.lnk'), $menu)) {
  $s = $ws.CreateShortcut($lnk)
  if ($edge) { $s.TargetPath = $edge; $s.Arguments = '--app="' + ([uri]$html).AbsoluteUri + '"' }
  else { $s.TargetPath = $html }
  $s.WorkingDirectory = $destino
  $s.IconLocation = "$ico,0"
  $s.Description = 'Laudos hidrogeologicos - Wilton Rocha Hidrogeologia' # sem acento: o PowerShell 5 lê o arquivo sem BOM como ANSI
  $s.Save()
}
Write-Host ''
Write-Host 'Pronto! O atalho "Wilton Rocha - Laudos" foi criado na area de trabalho.'
