package data

import "go.mongodb.org/mongo-driver/bson/primitive"

type TeamDocument struct {
	DID primitive.ObjectID `bson:"_id,omitempty"` // DocumentID

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
