# Download sound files
$soundFiles = @{
    "timer-end.mp3" = "https://www.soundjay.com/button/beep-01a.mp3"
    "cafe-ambience.mp3" = "https://www.soundjay.com/ambient/coffee-shop-ambience-01.mp3"
    "rain.mp3" = "https://www.soundjay.com/nature/rain-02.mp3"
    "nature.mp3" = "https://www.soundjay.com/nature/birds-chirping-01.mp3"
    "white-noise.mp3" = "https://www.soundjay.com/ambient/white-noise-01.mp3"
}

# Create sounds directory if it doesn't exist
if (-not (Test-Path -Path "sounds")) {
    New-Item -ItemType Directory -Path "sounds"
}

# Download each sound file
foreach ($file in $soundFiles.GetEnumerator()) {
    $outputPath = Join-Path -Path "sounds" -ChildPath $file.Key
    Write-Host "Downloading $($file.Key)..."
    Invoke-WebRequest -Uri $file.Value -OutFile $outputPath
    Write-Host "Downloaded $($file.Key)"
}

Write-Host "All sound files have been downloaded successfully!"
