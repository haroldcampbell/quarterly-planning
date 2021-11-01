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

	epicService, _ := rt.services()
	activeEpic, err := epicService.GetEpicByID(activeEpicID)
	if err != nil {
		logger.Error("Error executing GetEpicByID(activeEpicID). activeEpicID: %v Error: %s", activeEpicID, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	err = rt.createUpstreamEpics(logger, as, activeEpic, upstreamIDsJSON)
	if err != nil {
		logger.Error("%v", err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	err = rt.createDownstreamEpics(logger, as, activeEpic, downstreamIDsJSON)
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

func (rt *DependencyRouter) createUpstreamEpics(logger *utils.RoutineLogger, as *serverutils.ActionStatus, activeEpic data.Epic, upstreamIDsJSON string) error {
	upstreamEpicIDs := []string{}
	err := json.Unmarshal([]byte(upstreamIDsJSON), &upstreamEpicIDs)
	if err != nil {
		return fmt.Errorf("Error reading upstreamIDsJSON from client : %v Error: %s", upstreamIDsJSON, err)
	}

	epicService, downstreamService := rt.services()

	upstreamEpics, err := epicService.GetEpicsByID(upstreamEpicIDs)
	if err != nil {
		return fmt.Errorf("Error executing GetEpicsByID(upstreamEpicIDs). upstreamEpicIDs: %v Error: %s", upstreamEpicIDs, err)
	}

	updatedEpic, err := downstreamService.CreateUpstreamEpics(activeEpic, upstreamEpics)
	if err != nil {
		return fmt.Errorf("Error executing CreateUpstreamEpics(activeEpic, upstreamEpics). activeEpic: %v upstreamEpics: %v, Error: %s", activeEpic, upstreamEpics, err)
	}

	err = epicService.UpdateEpic(updatedEpic)
	if err != nil {
		return fmt.Errorf("Error executing UpdateEpic(updatedEpic). updatedEpic: %v, Error: %s", updatedEpic, err)
	}

	return nil
}

func (rt *DependencyRouter) createDownstreamEpics(logger *utils.RoutineLogger, as *serverutils.ActionStatus, activeEpic data.Epic, downstreamIDsJSON string) error {
	downstreamEpicIDs := []string{}
	err := json.Unmarshal([]byte(downstreamIDsJSON), &downstreamEpicIDs)
	if err != nil {
		return fmt.Errorf("Error reading downstreamIDsJSON from client : %v Error: %s", downstreamIDsJSON, err)
	}

	epicService, downstreamService := rt.services()

	downstreamEpics, err := epicService.GetEpicsByID(downstreamEpicIDs)
	if err != nil {
		return fmt.Errorf("Error executing GetEpicsByID(downstreamEpicIDs). downstreamEpicIDs: %v Error: %s", downstreamEpicIDs, err)
	}

	err = epicService.UnlinkEpicAsUpstreamByEpicID(activeEpic.ID)
	if err != nil {
		return fmt.Errorf("Error executing UnlinkEpicAsUpstreamByEpicID(activeEpic). activeEpic: %v  Error: %s", activeEpic, err)
	}

	downstreamEpics, err = downstreamService.CreateDownstreamEpics(activeEpic, downstreamEpics)
	if err != nil {
		return fmt.Errorf("Error executing CreateDownstreamEpics(activeEpic, downstreamEpics). activeEpic: %v downstreamEpics: %v, Error: %s", activeEpic, downstreamEpics, err)
	}

	err = epicService.UpdateEpicsUpstreams(downstreamEpics)
	if err != nil {
		return fmt.Errorf("Error executing UpdateEpics(downstreamEpics). downstreamEpics: %v, Error: %s", downstreamEpics, err)
	}

	return nil
}
