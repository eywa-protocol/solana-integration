package serializer

import (
	"github.com/mr-tron/base58"
	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/types"
)

type UInt256 [32]byte
type UInt160 [20]byte

func PublicKeyFromBase58(s string) UInt256 {
	d, _ := base58.Decode(s)
	return Uint256FromBytes(d)
}

func Uint256FromBytes(b []byte) UInt256 {
	var a UInt256
	if len(b) > 32 {
		b = b[:32]
	}
	copy(a[32-len(b):], b)
	return a
}

func Uint160FromBytes(b []byte) UInt160 {
	var a UInt160
	if len(b) > 32 {
		b = b[:32]
	}
	copy(a[20-len(b):], b)
	return a
}

func (p UInt256) ToBase58() string {
	return common.PublicKey(p).ToBase58()
}

func (p UInt256) Bytes() []byte {
	return p[:]
}

func (p UInt160) Bytes() []byte {
	return p[:]
}

// type AccountMeta struct {
// 	PubKey     UInt256
// 	IsSigner   bool
// 	IsWritable bool
// }

// type Instruction struct {
// 	ProgramID UInt256
// 	Accounts  []AccountMeta
// 	Data      []byte
// }

// func (acc AccountMeta) Serialize() []byte {
// 	fmt.Println("AccountMeta:", acc)

// 	return []byte{}
// }

// func (ix Instruction) Serialize() []byte {
// 	fmt.Println("Instruction:", ix)

// 	return []byte{}
// }

type TransactionAccount struct {
	PubKey     UInt256
	IsSigner   bool
	IsWritable bool
}
type StandaloneInstruction struct {
	ProgramId UInt256
	Accounts  []TransactionAccount
	Data      []byte
}

func (m *StandaloneInstruction) Serialize() ([]byte, error) {
	b := []byte{}
	b = append(b, m.ProgramId.Bytes()...)
	for _, acc := range m.Accounts {
		b = append(b, acc.PubKey[:]...)
	}
	b = append(b, m.Data...)
	return b, nil
}

func CreateStandaloneInstruction(inst types.Instruction) StandaloneInstruction {
	accounts := []TransactionAccount{}
	for _, acc := range inst.Accounts {
		accounts = append(accounts, TransactionAccount{
			PubKey:     UInt256(acc.PubKey),
			IsSigner:   acc.IsSigner,
			IsWritable: acc.IsWritable,
		})
	}

	return StandaloneInstruction{
		ProgramId: UInt256(inst.ProgramID),
		Accounts:  accounts,
		Data:      inst.Data,
	}
}
