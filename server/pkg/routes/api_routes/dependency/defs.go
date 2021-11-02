package dependency

type DependencyRouter struct {
	ServicesMap map[string]interface{}
}

// func (rt *DependencyRouter) services() (*data.EpicServiceMongo, *data.DownstreamServiceMongo) {
// 	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)
// 	downstreamService := rt.ServicesMap[data.DownstreamServiceKey].(*data.DownstreamServiceMongo)

// 	return epicService, downstreamService
// }
