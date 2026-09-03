$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mysql = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe'
$mysqlData = 'C:\mysql\data'

function Test-Port($port) {
    return (Test-NetConnection -ComputerName 'localhost' -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue)
}

if (-not (Test-Port 3306)) {
    if (-not (Test-Path $mysql)) {
        throw "MySQL was not found at $mysql."
    }
    if (-not (Test-Path $mysqlData)) {
        throw "MySQL data directory was not found at $mysqlData."
    }
    Start-Process -FilePath $mysql -ArgumentList "--datadir=$mysqlData" -WindowStyle Hidden
    for ($i = 0; $i -lt 30 -and -not (Test-Port 3306); $i++) {
        Start-Sleep -Seconds 1
    }
}

if (-not (Test-Port 8080)) {
    Start-Process -FilePath "$root\mvnw.cmd" `
        -ArgumentList 'spring-boot:run' `
        -WorkingDirectory $root `
        -WindowStyle Hidden
    for ($i = 0; $i -lt 60 -and -not (Test-Port 8080); $i++) {
        Start-Sleep -Seconds 1
    }
}

if (-not (Test-Port 8000)) {
    Start-Process -FilePath 'python' `
        -ArgumentList '-m', 'http.server', '8000', '--directory', "$root\frontend" `
        -WorkingDirectory $root `
        -WindowStyle Hidden
    for ($i = 0; $i -lt 15 -and -not (Test-Port 8000); $i++) {
        Start-Sleep -Seconds 1
    }
}

if (-not (Test-Port 8080) -or -not (Test-Port 8000)) {
    throw 'CodeGallery could not start all required services.'
}

Start-Process 'http://localhost:8000/index.html'
