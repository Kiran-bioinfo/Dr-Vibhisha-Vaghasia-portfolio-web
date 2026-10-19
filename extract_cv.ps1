Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxPath = Join-Path $PSScriptRoot "Dr_Vibhisha_CV_updated.docx"
$outPath = Join-Path $PSScriptRoot "cv_text.txt"

# Open with ReadWrite share in case file is currently open
$fs = [System.IO.File]::Open($docxPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$ms = New-Object System.IO.MemoryStream
$fs.CopyTo($ms)
$fs.Close()
$ms.Position = 0

$zip = New-Object System.IO.Compression.ZipArchive($ms)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
[xml]$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$ms.Dispose()

$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$nodes = $xml.SelectNodes("//w:p", $ns)
$lines = foreach ($p in $nodes) {
    $textRuns = $p.SelectNodes(".//w:t", $ns)
    if ($textRuns) {
        ($textRuns | ForEach-Object { $_.InnerText }) -join ""
    } else {
        ""
    }
}

$lines | Out-File -FilePath $outPath -Encoding utf8
Write-Output "Extracted $($lines.Count) lines."
