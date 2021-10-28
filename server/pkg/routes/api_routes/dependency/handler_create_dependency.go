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

	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)
	downstreamService := rt.ServicesMap[data.DownstreamServiceKey].(*data.DownstreamServiceMongo)

	activeEpicID := r.FormValue("active-epic-id")

	upstreamEpicIDs := []string{}
	upstreamIDsJSON := r.FormValue("upstream-connection-epic-ids")
	err := json.Unmarshal([]byte(upstreamIDsJSON), &upstreamEpicIDs)
	if err != nil {
		logger.Error("Error reading upstreamIDsJSON from client : %v Error: %s", upstreamIDsJSON, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	downstreamEpicIDs := []string{}
	downstreamIDsJSON := r.FormValue("downstream-connection-epic-ids")
	err = json.Unmarshal([]byte(downstreamIDsJSON), &downstreamEpicIDs)
	if err != nil {
		logger.Error("Error reading downstreamIDsJSON from client : %v Error: %s", downstreamIDsJSON, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	activeEpic, err := epicService.GetEpicByID(activeEpicID)
	if err != nil {
		logger.Error("Error executing GetEpicByID(activeEpicID). activeEpicID: %v Error: %s", activeEpicID, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	upstreamEpics, err := epicService.GetEpicsByID(upstreamEpicIDs)
	if err != nil {
		logger.Error("Error executing GetEpicsByID(upstreamEpicIDs). upstreamEpicIDs: %v Error: %s", upstreamEpicIDs, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	updatedEpic, err := downstreamService.CreateUpstreamEpics(activeEpic, upstreamEpics)
	if err != nil {
		logger.Error("Error executing CreateUpstreamEpics(activeEpic, upstreamEpics). activeEpic: %v upstreamEpics: %v, Error: %s", activeEpic, upstreamEpics, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	err = epicService.UpdateEpic(updatedEpic)
	if err != nil {
		logger.Error("Error executing UpdateEpic(updatedEpic). updatedEpic: %v, Error: %s\n", updatedEpic, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	// data.CreateEpicDependencyConnections(activeEpic, upstreamEpics, downstreamEpicIDs)

	response := CreateDependencyResponse{
		// ID: newModel.ID,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
