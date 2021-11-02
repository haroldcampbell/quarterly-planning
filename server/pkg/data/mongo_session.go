package data

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var NilFilter = bson.D{{}}

func documentIndex(documentKey string) mongo.IndexModel {
	t := true

	return mongo.IndexModel{
		Keys: bson.D{{Key: documentKey, Value: 1}},
		Options: &options.IndexOptions{
			Unique: &t,
			// DropDups:   true,
			Background: &t,
			Sparse:     &t,
			Collation: &options.Collation{
				Locale:   "en",
				Strength: 2,
			},
		},
	}
}

/** Session keys */
const EpicServiceKey = "EpicServiceKey"
const TeamServiceKey = "TeamServiceKey"
const DownstreamServiceKey = "DownstreamServiceKey"
const EpicConnectionServiceKey = "EpicConnectionServiceKey"

type Session struct {
	ctx    *context.Context
	client *mongo.Client
}

func NewSession(config *MongoConfig) (*Session, error) {
	var ctx = context.TODO()

	// clientOptions := options.Client().ApplyURI(config.IP)
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017/")
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	return &Session{&ctx, client}, err
}

func (s *Session) DropDatabase(db string) error {
	if s.client != nil {
		return s.client.Database(db).Drop(*s.ctx)
	}
	return nil
}

func (s *Session) BuildInfo(config *MongoConfig) (interface{}, error) {
	var info interface{}

	err := s.client.Database(config.DbName).RunCommand(*s.ctx, bson.M{"buildInfo": 1}).Decode(&info)

	return info, err
}
