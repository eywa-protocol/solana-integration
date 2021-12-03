package serializer

import (
	"fmt"

	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/types"
)

func CreateHelloInstruction(
	personName string,
	pidThisProgram common.PublicKey,
	pubAdmin common.PublicKey,
) types.Instruction {
	// [149, 118, 59, 220, 196, 127, 161, 179]
	// 95763bdcc47fa1b3
	InstructionHello := [8]uint8{
		149, 118, 59, 220, 196, 127, 161, 179,
	}
	fmt.Printf("InstructionHello: %x\n", InstructionHello)

	// personName := "World"
	dataHello, err := common.SerializeData(struct {
		Instruction [8]uint8
		nameLen     uint32
		name        string
	}{
		Instruction: InstructionHello,
		nameLen:     uint32(len(personName)),
		name:        personName,
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("dataHello: %x\n", dataHello)

	ixHello := types.Instruction{
		ProgramID: pidThisProgram,
		Accounts: []types.AccountMeta{
			// person: provider.wallet.publicKey,
			{PubKey: pubAdmin, IsSigner: true, IsWritable: false},
		},
		Data: dataHello,
	}

	return ixHello
}
