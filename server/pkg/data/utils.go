package data

import "github.com/haroldcampbell/go_utils/utils"

func arrayHasElementStr(elm string, arr []string) (bool, int) {
	for index, item := range arr {
		utils.Log("arrayHasElementStr", "item:%v == elm:%v status:%v", item, elm, (item == elm))
		if item == elm {
			return true, index
		}
	}

	return false, -1
}
