package data

import (
	"gopkg.in/mgo.v2/bson"
)

type TeamDocument struct {
	DID bson.ObjectId `bson:"_id,omitempty"` // DocumentID

	Team
}

func NewTeamDoc(doc *Team) *TeamDocument {
	return &TeamDocument{
		Team: *doc,
	}
}

func (doc *TeamDocument) ToModel() Team {
	return doc.Team
}
