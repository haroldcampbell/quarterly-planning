package data

// func GetTeams() []*Team {
// 	return teams
// }

// func GetEpics() []*Epic {
// 	return epics
// }

// func GetEpicByID(epicID string) *Epic {
// 	for _, epic := range epics {
// 		if epic.ID == epicID {
// 			return epic
// 		}
// 	}
// 	return nil
// }

// func CreateEpic(model Epic) (Epic, error) {
// 	model.ID = serverutils.GenerateGUID()
// 	epics = append(epics, &model)

// 	return model, nil
// }

/////////////==================================================================

// func removeEpicAsUpstream(downstreamEpic *Epic, upstreamEpicID string) {
// 	if downstreamEpic.Upstreams == nil {
// 		return
// 	}

// 	tempEpic := GetEpicByID(upstreamEpicID)

// 	if found, index := arrayHasElementStr(tempEpic.ID, downstreamEpic.Upstreams); found {
// 		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams[:index], downstreamEpic.Upstreams[index+1:]...)
// 	}
// }

// func createDownstreamEpics(upstreamEpic *Epic, downstreamEpicIDs []string) {
// 	epics := GetEpics()
// 	for _, e := range epics {
// 		removeEpicAsUpstream(e, upstreamEpic.ID)
// 	}

// 	downstreamEpics := make([]*Epic, 0, len(downstreamEpicIDs))
// 	for _, epicID := range downstreamEpicIDs {
// 		tempEpic := GetEpicByID(epicID)
// 		downstreamEpics = append(downstreamEpics, tempEpic)
// 	}

// 	for _, downstreamEpic := range downstreamEpics {
// 		if downstreamEpic.Upstreams == nil {
// 			downstreamEpic.Upstreams = make([]string, 0)
// 		}

// 		if found, _ := arrayHasElementStr(upstreamEpic.ID, downstreamEpic.Upstreams); found {
// 			/* Move on since already contained as upstream epic */
// 			continue
// 		}

// 		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams, upstreamEpic.ID)
// 		addDownstreamEpic(upstreamEpic.ID, downstreamEpic.ID)
// 	}
// }

// func CreateEpicDependencyConnections(activeEpic Epic, upstreamEpics []Epic, downstreamEpicIDs []string) error {

// 	if activeEpic == nil {
// 		return fmt.Errorf("Unknow/Invalid Epic ID: %v", activeEpicID)
// 	}

// 	createUpstreamEpics(activeEpic, upstreamEpics)
// 	// createDownstreamEpics(activeEpic, downstreamEpicIDs)

// 	return nil
// }
