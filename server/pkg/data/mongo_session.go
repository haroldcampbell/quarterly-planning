package data

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// func documentIndex(documentKey string) mgo.Index {
// 	return mgo.Index{
// 		Key:        []string{documentKey},
// 		Unique:     true,
// 		DropDups:   true,
// 		Background: true,
// 		Sparse:     true,
// 		Collation: &mgo.Collation{
// 			Locale:   "en",
// 			Strength: 2,
// 		},
// 	}
// }

var NilFilter = bson.D{{}}

func documentIndex(documentKey string) mongo.IndexModel {
	t := true

	return mongo.IndexModel{
		Keys: bson.D{{documentKey, 1}},
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

type Session struct {
	// session *mgo.Session
	ctx    *context.Context
	client *mongo.Client
}

func NewSession(config *MongoConfig) (*Session, error) {
	var ctx = context.TODO()

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
	//var err error
	// session, err := mgo.Dial(config.IP)
	// if err != nil {
	// 	return nil, err
	// }
	// session.SetMode(mgo.Monotonic, true)
	// return &Session{session}, err
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

// func (s *Session) Copy() *mgo.Session {
// 	return s.session.Copy()
// }

// func (s *Session) Close() {
// 	if s.session != nil {
// 		s.session.Close()
// 	}
// }
