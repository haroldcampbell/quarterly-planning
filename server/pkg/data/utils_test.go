package data

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestArrayHasElement(t *testing.T) {
	arr := []string{"1", "2", "3", "4"}
	found, _ := arrayHasElementStr("1", arr)

	assert.Equal(t, found, true, "expect to find element")
}
