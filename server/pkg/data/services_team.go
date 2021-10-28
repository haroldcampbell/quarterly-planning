package data

import (
	"github.com/haroldcampbell/go_utils/serverutils"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// type TeamService interface {
// 	CreateTeam(team *Team) (string, error)
// 	GetTeams() ([]Team, error)
// }

type TeamServiceMongo struct {
	collection *mgo.Collection
}

func NewTeamService(session *mgo.Session, config *MongoConfig) *TeamServiceMongo {
	collection := session.DB(config.DbName).C("teams")
	collection.EnsureIndex(documentIndex("TeamKey"))

	return &TeamServiceMongo{collection: collection}
}

func (s *TeamServiceMongo) CreateTeam(team *Team) (string, error) {
	doc := NewTeamDoc(team)
	doc.DID = bson.NewObjectId()
	doc.Team.ID = serverutils.GenerateGUID()

	return doc.Team.ID, s.collection.Insert(doc)
}

func (s *TeamServiceMongo) GetTeams() ([]Team, error) {
	var docs []TeamDocument

	err := s.collection.Find(nil).All(&docs)
	// err := s.collection.Find(bson.M{"team.id": teamID}).All(&docs)
	result := make([]Team, 0, len(docs))

	for _, doc := range docs {
		result = append(result, doc.ToModel())
	}

	return result, err
}
