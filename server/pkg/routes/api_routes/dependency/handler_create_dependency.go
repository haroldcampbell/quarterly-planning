package dependency

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"encoding/json"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type CreateDependencyResponse struct {
	// ID string
}

func (rt *DependencyRouter) CreateDependencyHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("createDependencyHandler")
	var logger = utils.NewGoRoutineLogger("createDependencyHandler")
	as := &serverutils.ActionStatus{Action: "createDependencyHandler", Writer: w}

	downstreamEpicIDs := &[]string{}
	upstreamEpicIDs := &[]string{}
	activeEpicID := r.FormValue("active-epic-id")

	upstreamIDsJSON := r.FormValue("upstream-connection-epic-ids")
	err := json.Unmarshal([]byte(upstreamIDsJSON), upstreamEpicIDs)
	if err != nil {
		logger.Error("Error reading upstreamIDsJSON from client : %v Error: %s\n", upstreamIDsJSON, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	downstreamIDsJSON := r.FormValue("downstream-connection-epic-ids")
	err = json.Unmarshal([]byte(downstreamIDsJSON), downstreamEpicIDs)
	if err != nil {
		logger.Error("Error reading downstreamIDsJSON from client : %v Error: %s\n", downstreamIDsJSON, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	data.CreateEpicDependencyConnections(activeEpicID, *upstreamEpicIDs, *downstreamEpicIDs)

	// if err != nil {
	// 	logger.Error("Failed to create new Epic.TeamID[%s]: %v", model.TeamID, err)
	// 	serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
	// 	return
	// }

	response := CreateDependencyResponse{
		// ID: newModel.ID,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
