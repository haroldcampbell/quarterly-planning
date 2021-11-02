package data

type Team struct {
	ID   string
	Name string
}

type Epic struct {
	ID                  string
	TeamID              string
	Name                string
	ExpectedStartPeriod float32
	Size                float32
	// Upstreams           []string /* List of Epic IDs*/
}
