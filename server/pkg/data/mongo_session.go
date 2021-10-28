package data

import (
	"gopkg.in/mgo.v2"
)

func documentIndex(documentKey string) mgo.Index {
	return mgo.Index{
		Key:        []string{documentKey},
		Unique:     true,
		DropDups:   true,
		Background: true,
		Sparse:     true,
		Collation: &mgo.Collation{
			Locale:   "en",
			Strength: 2,
		},
	}
}

/** Session keys */
const EpicServiceKey = "EpicServiceKey"
const TeamServiceKey = "TeamServiceKey"
const DownstreamServiceKey = "DownstreamServiceKey"

type Session struct {
	session *mgo.Session
}

func NewSession(config *MongoConfig) (*Session, error) {
	//var err error
	session, err := mgo.Dial(config.IP)
	if err != nil {
		return nil, err
	}
	session.SetMode(mgo.Monotonic, true)
	return &Session{session}, err
}

func (s *Session) DropDatabase(db string) error {
	if s.session != nil {
		return s.session.DB(db).DropDatabase()
	}
	return nil
}

func (s *Session) Copy() *mgo.Session {
	return s.session.Copy()
}

func (s *Session) Close() {
	if s.session != nil {
		s.session.Close()
	}
}
