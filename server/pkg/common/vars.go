package common

const LogStem = "epicz"

var PathToWWW = "../client/www" // pathToWWW is the location of the html, js, and css files
var PathToWWWTemplates = "../client/www_templates" // PathToWWWTemplates is the location of the go template files

var EnvFilename = ".env"
var CSRFTokenKey = "EPICZ_TAP_CSRF_TOKEN"
var CSRFToken string

var AdminTokenKey = "EPICZ_TAP_ADMIN_CONSOLE_TOKEN"
var AdminToken string // Token used to access the admin console
