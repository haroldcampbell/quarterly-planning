package cmd

import (
	"dependency/server/pkg/data"

	"github.com/haroldcampbell/go_utils/utils"
)

func InitializeDatabase(dbName string) {
	stem := "InitializeDatabase"

	utils.Log(stem, "Attempting to connect to database...")
	mongoConfig := data.NewMongoConfig(mongoURL, dbName)
	session, err := data.NewSession(mongoConfig)
	if err != nil {
		msg := utils.ErrorMsg(stem, "Unable to connect to database: %v", err)
		panic(msg)
	}
	// buildInfo, _ := session.Copy().BuildInfo()
	// utils.Log(stem, "Mongo BuildInfo:%v", buildInfo)

	err = session.DropDatabase(dbName)
	if err != nil {
		utils.Log(stem, "Failed to reset database: %v", err)
		return
	}

	// Initialize services
	utils.Log(stem, "Priming database...")
	teamService := data.NewTeamService(session, mongoConfig)
	epicService := data.NewEpicService(session, mongoConfig)

	teamIDMapping := make(map[string]string)
	for _, team := range teams {
		utils.Log(stem, "Inserting team data: %v", team)
		oldTeamID := team.ID
		teamID, err := teamService.CreateTeam(team)
		if err != nil {
			utils.Log(stem, "Failed to insert team: %v", err)
			return
		}
		teamIDMapping[oldTeamID] = teamID

		// switch index {
		// case 0:
		// 	teamIDMapping["A1"] = teamID
		// 	break
		// case 1:
		// 	teamIDMapping["A2"] = teamID
		// 	break
		// case 2:
		// 	teamIDMapping["A3"] = teamID
		// 	break
		// }
	}

	var newEpics = make([]*data.Epic, 0)

	for _, epic := range epics {
		epic.TeamID = teamIDMapping[epic.TeamID] // TeamID to TeamID GUID

		utils.Log(stem, "Inserting epic data: %v", epic)
		newEpicID, err := epicService.CreateEpic(epic)
		if err != nil {
			utils.Log(stem, "Failed to insert epic: %v", err)
		}

		epic.ID = newEpicID
		newEpics = append(newEpics, epic)
	}

	epicConnectionService := data.NewEpicConnectionService(session, mongoConfig)
	epicConnectionService.CreateEpicConnection(newEpics[0].ID, newEpics[1].ID)
	epicConnectionService.CreateEpicConnection(newEpics[1].ID, newEpics[5].ID)
	epicConnectionService.CreateEpicConnection(newEpics[2].ID, newEpics[5].ID)
	epicConnectionService.CreateEpicConnection(newEpics[3].ID, newEpics[5].ID)
	epicConnectionService.CreateEpicConnection(newEpics[1].ID, newEpics[4].ID)
	epicConnectionService.CreateEpicConnection(newEpics[5].ID, newEpics[8].ID)
	epicConnectionService.CreateEpicConnection(newEpics[8].ID, newEpics[9].ID)

}
