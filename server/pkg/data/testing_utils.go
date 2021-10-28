package data

import (
	"encoding/csv"
	"os"
	"testing"

	"github.com/haroldcampbell/go_utils/utils"

	"github.com/stretchr/testify/assert"
)

const mongoURL = "127.0.0.1:27017"
const DBTestName = "dependency_app_db_test"

func InitTestDB(stem string) (*Session, *MongoConfig) {
	mongoConfig := NewMongoConfig(mongoURL, DBTestName)
	session, err := NewSession(mongoConfig)
	if err != nil {
		msg := utils.ErrorMsg(stem, "Unable to connect to database: %v", err)
		panic(msg)
	}

	buildInfo, _ := session.Copy().BuildInfo()
	utils.Log(stem, "Mongo BuildInfo:%v", buildInfo)

	return session, mongoConfig
}

func CleanupTestDB(stem string, session *Session) {
	err := session.DropDatabase(DBTestName)
	if err != nil {
		msg := utils.ErrorMsg(stem, "Unable to drop database: %v", err)
		panic(msg)
	}
}

func fixtureCSVReader(t *testing.T, filepath string) (*os.File, *csv.Reader) {
	file, err := os.Open(filepath)

	assert.NoError(t, err)

	return file, csv.NewReader(file)
}
