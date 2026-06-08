git push origin main
Start-Sleep -Seconds 45
$latest = (npx vercel ls --prod 2>$null | Select-String "mio-ecommerce-[a-z0-9]+-oreldi" | Select-Object -First 1).ToString().Trim().Split()[0]
if ($latest) {
    npx vercel alias set $latest illyrian-ecommerce.vercel.app
    Write-Host "Deployed and alias updated to $latest"
} else {
    Write-Host "Could not find latest deployment URL - run alias manually"
}
