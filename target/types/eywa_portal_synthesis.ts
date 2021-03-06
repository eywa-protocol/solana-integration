export type EywaPortalSynthesis = {
  "version": "0.0.0",
  "name": "eywa_portal_synthesis",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridge",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeed",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setBridge",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridge",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setOwner",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "mintSyntheticToken",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintSynt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "synthesizeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bridge",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "txId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "bumpRequest",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyUnsyntesizeRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "synthesizeRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bridgeSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnSyntheticToken",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "txState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintSynt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "chainToAddress",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyUnburn",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "txState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintSynt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bridgeSigner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createRepresentation",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintSynt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeedMint",
          "type": "u8"
        },
        {
          "name": "bumpSeedData",
          "type": "u8"
        },
        {
          "name": "tokenReal",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "syntDecimals",
          "type": "u8"
        },
        {
          "name": "syntName",
          "type": "string"
        },
        {
          "name": "syntSymbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "createRepresentationRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "synthesize",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "txState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridgeSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeedSynthesizeRequest",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "chainToAddress",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyUnsynthesize",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "txState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeedSynthesizeRequest",
          "type": "u8"
        }
      ]
    },
    {
      "name": "unsynthesize",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "unsynthesizeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridge",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyUnburnRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "unsynthesizeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "statesMasterAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nonceMasterAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridgeNonce",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bridgeSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "settings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "synthesisRequestCount",
            "type": "u64"
          },
          {
            "name": "portalRequestCount",
            "type": "u64"
          },
          {
            "name": "bridge",
            "type": "publicKey"
          },
          {
            "name": "bridgeSigner",
            "type": "publicKey"
          },
          {
            "name": "realTokens",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "syntTokens",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "mintData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenReal",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "tokenSynt",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "bumpMint",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "synthesizeStateData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          },
          {
            "name": "chainToAddress",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "oppositeBridge",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "realToken",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "state",
            "type": {
              "defined": "SynthesizeState"
            }
          }
        ]
      }
    },
    {
      "name": "unsynthesizeStateData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": {
              "defined": "UnsynthesizeState"
            }
          }
        ]
      }
    },
    {
      "name": "txState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "txId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          },
          {
            "name": "chainToAddress",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "oppositeBridge",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "syntToken",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "state",
            "type": {
              "defined": "RequestState"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PortalBridgeMethod",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "EmergencyUnsynthesize"
          },
          {
            "name": "Unsynthesize"
          }
        ]
      }
    },
    {
      "name": "SynthesisBridgeMethod",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "MintSyntheticToken"
          },
          {
            "name": "EmergencyUnburn"
          }
        ]
      }
    },
    {
      "name": "SynthesizeState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "Synthesized"
          },
          {
            "name": "RevertRequest"
          }
        ]
      }
    },
    {
      "name": "UnsynthesizeState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "Unsynthesized"
          },
          {
            "name": "RevertRequest"
          }
        ]
      }
    },
    {
      "name": "RequestState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "Sent"
          },
          {
            "name": "Reverted"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "BurnRequest",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevertSynthesizeRequest",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "SynthesizeCompleted",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        }
      ]
    },
    {
      "name": "RevertBurnCompleted",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedRepresentation",
      "fields": [
        {
          "name": "stoken",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "rtoken",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": true
        }
      ]
    },
    {
      "name": "RepresentationRequest",
      "fields": [
        {
          "name": "rtoken",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "ApprovedRepresentationRequest",
      "fields": [
        {
          "name": "rtoken",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "SynthesizeRequest",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "realToken",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevertBurnRequest",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "BurnCompleted",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevertSynthesizeCompleted",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 2300,
      "name": "UnknownError",
      "msg": "Unknown Error"
    },
    {
      "code": 2301,
      "name": "OnlyBridge",
      "msg": "OnlyBridge access constraint"
    },
    {
      "code": 2302,
      "name": "TokenAlreadyRegistred",
      "msg": "Token already registred"
    },
    {
      "code": 3300,
      "name": "UnknownPortalError",
      "msg": "Unknown Portal Error"
    },
    {
      "code": 4300,
      "name": "UnknownSynthesisError",
      "msg": "Unknown Synthesis Error"
    },
    {
      "code": 4301,
      "name": "StateNotOpen",
      "msg": "Synt: state not open or tx does not exist"
    }
  ]
};

export const IDL: EywaPortalSynthesis = {
  "version": "0.0.0",
  "name": "eywa_portal_synthesis",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridge",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeed",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setBridge",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridge",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setOwner",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "mintSyntheticToken",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintSynt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "synthesizeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bridge",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "txId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "bumpRequest",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyUnsyntesizeRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "synthesizeRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bridgeSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnSyntheticToken",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "txState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintSynt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "chainToAddress",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyUnburn",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "txState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintSynt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintData",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bridgeSigner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createRepresentation",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintSynt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeedMint",
          "type": "u8"
        },
        {
          "name": "bumpSeedData",
          "type": "u8"
        },
        {
          "name": "tokenReal",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "syntDecimals",
          "type": "u8"
        },
        {
          "name": "syntName",
          "type": "string"
        },
        {
          "name": "syntSymbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "createRepresentationRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "synthesize",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "txState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridgeSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeedSynthesizeRequest",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "chainToAddress",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyUnsynthesize",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "txState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeedSynthesizeRequest",
          "type": "u8"
        }
      ]
    },
    {
      "name": "unsynthesize",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "unsynthesizeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridge",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyUnburnRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "unsynthesizeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "statesMasterAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nonceMasterAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bridgeNonce",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bridgeSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "settings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "synthesisRequestCount",
            "type": "u64"
          },
          {
            "name": "portalRequestCount",
            "type": "u64"
          },
          {
            "name": "bridge",
            "type": "publicKey"
          },
          {
            "name": "bridgeSigner",
            "type": "publicKey"
          },
          {
            "name": "realTokens",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "syntTokens",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "mintData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenReal",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "tokenSynt",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "bumpMint",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "synthesizeStateData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          },
          {
            "name": "chainToAddress",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "oppositeBridge",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "realToken",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "state",
            "type": {
              "defined": "SynthesizeState"
            }
          }
        ]
      }
    },
    {
      "name": "unsynthesizeStateData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": {
              "defined": "UnsynthesizeState"
            }
          }
        ]
      }
    },
    {
      "name": "txState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "txId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          },
          {
            "name": "chainToAddress",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "oppositeBridge",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "syntToken",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "state",
            "type": {
              "defined": "RequestState"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PortalBridgeMethod",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "EmergencyUnsynthesize"
          },
          {
            "name": "Unsynthesize"
          }
        ]
      }
    },
    {
      "name": "SynthesisBridgeMethod",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "MintSyntheticToken"
          },
          {
            "name": "EmergencyUnburn"
          }
        ]
      }
    },
    {
      "name": "SynthesizeState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "Synthesized"
          },
          {
            "name": "RevertRequest"
          }
        ]
      }
    },
    {
      "name": "UnsynthesizeState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "Unsynthesized"
          },
          {
            "name": "RevertRequest"
          }
        ]
      }
    },
    {
      "name": "RequestState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Default"
          },
          {
            "name": "Sent"
          },
          {
            "name": "Reverted"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "BurnRequest",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevertSynthesizeRequest",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "SynthesizeCompleted",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        }
      ]
    },
    {
      "name": "RevertBurnCompleted",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedRepresentation",
      "fields": [
        {
          "name": "stoken",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "rtoken",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": true
        }
      ]
    },
    {
      "name": "RepresentationRequest",
      "fields": [
        {
          "name": "rtoken",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "ApprovedRepresentationRequest",
      "fields": [
        {
          "name": "rtoken",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "SynthesizeRequest",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "realToken",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevertBurnRequest",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "BurnCompleted",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevertSynthesizeCompleted",
      "fields": [
        {
          "name": "id",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 2300,
      "name": "UnknownError",
      "msg": "Unknown Error"
    },
    {
      "code": 2301,
      "name": "OnlyBridge",
      "msg": "OnlyBridge access constraint"
    },
    {
      "code": 2302,
      "name": "TokenAlreadyRegistred",
      "msg": "Token already registred"
    },
    {
      "code": 3300,
      "name": "UnknownPortalError",
      "msg": "Unknown Portal Error"
    },
    {
      "code": 4300,
      "name": "UnknownSynthesisError",
      "msg": "Unknown Synthesis Error"
    },
    {
      "code": 4301,
      "name": "StateNotOpen",
      "msg": "Synt: state not open or tx does not exist"
    }
  ]
};
