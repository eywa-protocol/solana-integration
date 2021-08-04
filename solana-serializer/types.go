package serializer

import (
	"fmt"
)

type AccountMeta struct {
	PubKey     [32]byte
	IsSigner   bool
	IsWritable bool
}

type Instruction struct {
	ProgramID [32]byte
	Accounts  []AccountMeta
	Data      []byte
}

func (acc AccountMeta) Serialize() []byte {
	fmt.Println("AccountMeta:", acc)

	return []byte{}
}

func (ix Instruction) Serialize() []byte {
	fmt.Println("Instruction:", ix)

	return []byte{}
}
