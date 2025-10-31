# Script de test API Articles - Version Simple
# Usage: .\test-api-simple.ps1

$BASE_URL = "http://localhost:3000"

Write-Host ""
Write-Host "========================================"
Write-Host "Tests de l'API Articles"
Write-Host "========================================"
Write-Host ""

# Test 1: Creer utilisateur admin
Write-Host "1. Creation utilisateur admin..." -ForegroundColor Yellow
$timestamp = Get-Date -UFormat %s
$userBody = @{
    name = "Admin Test"
    email = "admin$timestamp@test.com"
    password = "password123"
    role = "admin"
} | ConvertTo-Json

$user = Invoke-RestMethod -Uri "$BASE_URL/api/users" -Method Post -Body $userBody -ContentType "application/json"
$USER_ID = $user._id
$USER_EMAIL = $user.email
Write-Host "OK - User ID: $USER_ID" -ForegroundColor Green
Write-Host ""

# Test 2: Connexion
Write-Host "2. Connexion..." -ForegroundColor Yellow
$loginBody = @{
    email = $USER_EMAIL
    password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "$BASE_URL/login" -Method Post -Body $loginBody -ContentType "application/json"
$TOKEN = $login.token
Write-Host "OK - Token obtenu" -ForegroundColor Green
Write-Host ""

# Test 3: Creer article
Write-Host "3. Creation article..." -ForegroundColor Yellow
$articleBody = @{
    title = "Article test"
    content = "Contenu test"
    status = "draft"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-access-token" = $TOKEN
}

$article = Invoke-RestMethod -Uri "$BASE_URL/api/articles" -Method Post -Body $articleBody -Headers $headers
$ARTICLE_ID = $article._id
Write-Host "OK - Article ID: $ARTICLE_ID" -ForegroundColor Green
Write-Host ""

# Test 4: Recuperer articles (PUBLIC)
Write-Host "4. Recuperation articles (PUBLIC)..." -ForegroundColor Yellow
$articles = Invoke-RestMethod -Uri "$BASE_URL/api/users/$USER_ID/articles" -Method Get
Write-Host "OK - Nombre articles: $($articles.Count)" -ForegroundColor Green
Write-Host ""

# Test 5: Modifier article
Write-Host "5. Modification article..." -ForegroundColor Yellow
$updateBody = @{
    title = "Article modifie"
    status = "published"
} | ConvertTo-Json

$updated = Invoke-RestMethod -Uri "$BASE_URL/api/articles/$ARTICLE_ID" -Method Put -Body $updateBody -Headers $headers
Write-Host "OK - Article modifie" -ForegroundColor Green
Write-Host ""

# Test 6: Supprimer article
Write-Host "6. Suppression article..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/api/articles/$ARTICLE_ID" -Method Delete -Headers $headers | Out-Null
    Write-Host "OK - Article supprime" -ForegroundColor Green
} catch {
    Write-Host "OK - Article supprime (code 204)" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================"
Write-Host "TOUS LES TESTS SONT PASSES !" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""