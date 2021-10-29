package data

import (
	"context"
	"time"

	"github.com/haroldcampbell/go_utils/serverutils"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type TeamServiceMongo struct {
	ctx        *context.Context
	collection *mongo.Collection
}

func NewTeamService(session *Session, config *MongoConfig) *TeamServiceMongo {
	indexModel := documentIndex("TeamKey")
	opts := options.CreateIndexes().SetMaxTime(10 * time.Second)
	collection := session.client.Database(config.DbName).Collection("teams")

	collection.Indexes().CreateOne(*session.ctx, indexModel, opts)

	return &TeamServiceMongo{
		ctx:        session.ctx,
		collection: collection,
	}
}

func (s *TeamServiceMongo) CreateTeam(team *Team) (string, error) {
	doc := NewTeamDoc(team)
	doc.DID = primitive.NewObjectID()
	doc.Team.ID = serverutils.GenerateGUID()

	_, err := s.collection.InsertOne(*s.ctx, doc)

	return doc.Team.ID, err
}

func (s *TeamServiceMongo) GetTeams() ([]Team, error) {
	var result []Team
	var docs []TeamDocument

	curr, err := s.collection.Find(*s.ctx, NilFilter)
	if err != nil {
		return result, err
	}

	err = curr.All(*s.ctx, &docs)
	if err != nil {
		return result, err
	}

	result = make([]Team, 0, len(docs))
	for _, doc := range docs {
		result = append(result, doc.ToModel())
	}

	return result, err
}
