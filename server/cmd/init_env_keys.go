package cmd

import (
	"dependency/server/pkg/common"

	"github.com/haroldcampbell/go_utils/envutils"
	"github.com/haroldcampbell/go_utils/utils"
)

func InitCSRFToken() {
	err := envutils.ReadEnvFile(common.EnvFilename)
	if err != nil {
		utils.Error("InitCSRFToken", "Error reading env file '%s': %v", common.EnvFilename, err)
		panic(err)
	}

	common.CSRFToken = envutils.GetEnv(common.CSRFTokenKey)
	if len(common.CSRFToken) != 0 {
		utils.Log("InitCSRFToken", "Found existing CSRFToken: %s", common.CSRFToken)
		return
	}

	common.CSRFToken, err = utils.SecureToken(32)
	if err != nil {
		utils.Error("InitCSRFToken", "Unable to generate secure token: %v", err)
		panic(err)
	}

	envutils.UpdateEnvFile(common.EnvFilename, common.CSRFTokenKey, common.CSRFToken)
}

// InitAdminToken generates and saves a new admin token to the common.EnvFilename
func InitAdminToken() {
	common.AdminToken, _ = utils.SecureToken(32)
	err := envutils.ReadEnvFile(common.EnvFilename)
	if err != nil {
		panic(err)
	}

	envutils.UpdateEnvFile(common.EnvFilename, common.AdminTokenKey, common.AdminToken)

	adminTokenStr := utils.ColoredBrightText(utils.RedTextFG, common.AdminToken)
	adminTokenKeyStr := utils.ColoredBrightText(utils.WhiteTextFG, "?admin_token")

	utils.Log("InitAdminToken", "Admin console: https://(production-host)/waiting-list-console/%s=%s", adminTokenKeyStr, adminTokenStr)
}
