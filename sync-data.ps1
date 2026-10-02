$ErrorActionPreference = 'Stop'
$base = 'https://api.hotpe.top/winnew'
$options = (Invoke-RestMethod ($base + '/options/version')).data
$records = [System.Collections.Generic.List[object]]::new()
foreach ($system in $options.SystemCodes) {
  foreach ($version in $options.Versions.($system.value)) {
    $files = (Invoke-RestMethod ($base + '/file-list?SystemCode=' + $system.value + '&Version=' + [uri]::EscapeDataString($version.value))).data
    foreach ($file in $files) {
            $hashType = if ($file.Sha256) { 'SHA256' } else { 'SHA1' }
            $hash = if ($file.Sha256) { $file.Sha256 } else { $file.Sha1 }
            $records.Add([pscustomobject]@{
              id = (($file.FileName -replace '[^a-zA-Z0-9]+', '-').ToLower())
              system = $system.label
              version = $file.VerCode
              releaseDate = $file.PushTime
              build = $file.BuildVer
              edition = $file.Edition
              language = $file.Language
              languageCode = $file.LanguageCode
              arch = $file.Architecture
              size = ('{0:N2} GB' -f ([double]$file.Size / 1GB))
              hashType = $hashType
              hash = $hash
              downloadUrl = $file.FilePath
              source = 'WinNew API / Microsoft 官方'
            })
    }
  }
}
$records = $records | Group-Object id | ForEach-Object { $_.Group[0] }
$records | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 data/images.json
Write-Output ('records=' + $records.Count)
