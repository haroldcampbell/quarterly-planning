package dependency

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"encoding/json"
	"fmt"
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

	activeEpicID := r.FormValue("active-epic-id")
	upstreamIDsJSON := r.FormValue("upstream-connection-epic-ids")
	downstreamIDsJSON := r.FormValue("downstream-connection-epic-ids")

	if !isValidInput(logger, activeEpicID) {
		logger.Error("Error: For values invalid")
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	epicConnectionService := rt.ServicesMap[data.EpicConnectionServiceKey].(*data.EpicConnectionServiceMongo)
	err := epicConnectionService.UnlinkEpicConnections(activeEpicID)
	if err != nil {
		logger.Error("Error executing UnlinkEpicConnections(activeEpicID). activeEpicID: %v Error: %s", activeEpicID, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	err = rt.createUpstreamEpics(logger, as, activeEpicID, upstreamIDsJSON)
	if err != nil {
		logger.Error("%v", err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	err = rt.createDownstreamEpics(logger, as, activeEpicID, downstreamIDsJSON)
	if err != nil {
		logger.Error("%v", err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	response := CreateDependencyResponse{}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}

func isValidInput(logger *utils.RoutineLogger, activeEpicID string) bool {
	if activeEpicID == "" {
		logger.Error("[isValidInput]Error: activeEpicID was nil")

		return false
	}

	return true
}

func (rt *DependencyRouter) createUpstreamEpics(logger *utils.RoutineLogger, as *serverutils.ActionStatus, activeEpicID string, upstreamIDsJSON string) error {
	upstreamEpicIDs := []string{}
	err := json.Unmarshal([]byte(upstreamIDsJSON), &upstreamEpicIDs)
	if err != nil {
		return fmt.Errorf("error reading upstreamIDsJSON from client : %v Error: %s", upstreamIDsJSON, err)
	}

	epicConnectionService := rt.ServicesMap[data.EpicConnectionServiceKey].(*data.EpicConnectionServiceMongo)

	for _, upstreamEpicID := range upstreamEpicIDs {
		err := epicConnectionService.CreateEpicConnection(upstreamEpicID, activeEpicID)
		if err != nil {
			return fmt.Errorf("error executing CreateEpicConnection(upstreamEpicID, activeEpicID). upstreamEpicID: %v activeEpicID: %v Error: %s", upstreamEpicID, activeEpicID, err)
		}
	}

	return nil
}

func (rt *DependencyRouter) createDownstreamEpics(logger *utils.RoutineLogger, as *serverutils.ActionStatus, activeEpicID string, downstreamIDsJSON string) error {
	downstreamEpicIDs := []string{}
	err := json.Unmarshal([]byte(downstreamIDsJSON), &downstreamEpicIDs)
	if err != nil {
		return fmt.Errorf("error reading downstreamIDsJSON from client : %v Error: %s", downstreamIDsJSON, err)
	}

	epicConnectionService := rt.ServicesMap[data.EpicConnectionServiceKey].(*data.EpicConnectionServiceMongo)

	for _, downstreamEpicID := range downstreamEpicIDs {
		err := epicConnectionService.CreateEpicConnection(activeEpicID, downstreamEpicID)
		if err != nil {
			return fmt.Errorf("error executing CreateEpicConnection(activeEpicID, downstreamEpicID). activeEpicID: %v downstreamEpicID: %v Error: %s", activeEpicID, downstreamEpicID, err)
		}
	}

	return nil
}
